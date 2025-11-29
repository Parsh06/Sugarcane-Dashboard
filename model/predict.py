#!/usr/bin/env python3
"""
Prediction service for the Sugarcane dashboard (improved).

Input  (stdin):  JSON payload with the user form values.
Output (stdout): JSON payload with predicted yield, sucrose/CRS projection,
                 top 5 NPK combinations, and sensitivity deltas.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple, Optional

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "dataset" / "finalSugarcaneDataset_cleaned_copy.csv"
ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = ARTIFACT_DIR / "rf_model.pkl"
META_PATH = ARTIFACT_DIR / "meta.pkl"


# ---------------------
# Data preparation
# ---------------------
def load_dataset() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")
    return pd.read_csv(DATA_PATH)


def preprocess_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, Optional[OneHotEncoder]]:
    # Drop columns with more than 50% missing
    thresh = int(0.5 * len(df))
    df = df.loc[:, df.isna().sum() < thresh].copy()

    # Numeric imputations
    for col in df.select_dtypes(include=[np.number]).columns:
        df[col] = df[col].fillna(df[col].median())

    # Object/string imputations
    for col in df.select_dtypes(include="object").columns:
        try:
            df[col] = df[col].fillna(df[col].mode().iloc[0])
        except Exception:
            df[col] = df[col].fillna("unknown")

    # Decide which object columns to one-hot encode
    obj_cols = df.select_dtypes(include="object").columns.tolist()
    cat_cols = [c for c in obj_cols if df[c].nunique() <= 50 and c.lower() != "date"]

    encoder = None
    if cat_cols:
        # Use sparse_output for scikit-learn >= 1.2, fallback to sparse for older versions
        try:
            encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
        except TypeError:
            # Fallback for older scikit-learn versions
            try:
                encoder = OneHotEncoder(handle_unknown="ignore", sparse=False)
            except TypeError:
                # Very old versions might not have sparse parameter
                encoder = OneHotEncoder(handle_unknown="ignore")
        
        encoded = encoder.fit_transform(df[cat_cols])
        
        # Convert to dense array if sparse matrix
        if hasattr(encoded, 'toarray'):
            encoded = encoded.toarray()
        
        # Build OH column names
        oh_cols = []
        for i, col in enumerate(cat_cols):
            categories = list(map(str, encoder.categories_[i]))
            oh_cols.extend([f"{col}__{val}" for val in categories])
        oh_df = pd.DataFrame(encoded, columns=oh_cols, index=df.index)
        df_num = pd.concat([df.drop(columns=cat_cols), oh_df], axis=1)
    else:
        df_num = df

    # Final pass to ensure no NaNs in df_num
    for col in df_num.columns:
        if df_num[col].isna().any():
            if pd.api.types.is_numeric_dtype(df_num[col]):
                df_num[col] = df_num[col].fillna(df_num[col].median())
            else:
                df_num[col] = df_num[col].fillna(0)

    # ensure deterministic column ordering
    df_num = df_num.sort_index(axis=1)
    return df_num, encoder


def train_model(force: bool = False) -> Tuple[RandomForestRegressor, Dict[str, Any]]:
    # Load model if present
    if MODEL_PATH.exists() and META_PATH.exists() and not force:
        model = pd.read_pickle(MODEL_PATH)
        meta = pd.read_pickle(META_PATH)
        return model, meta

    df = load_dataset()
    df_num, encoder = preprocess_dataframe(df)

    target = "crop_yield"
    if target not in df_num.columns:
        raise ValueError("Expected 'crop_yield' column in dataset.")

    # features: everything except target and any explicit date columns
    X = df_num.drop(columns=[target])
    y = df_num[target].astype(float)

    # drop any date-like columns if present
    date_cols = [c for c in X.columns if "date" in c.lower()]
    if date_cols:
        X = X.drop(columns=date_cols)

    features = X.columns.tolist()

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Model
    model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    # Metrics
    y_pred = model.predict(X_test)
    metrics = {
        "r2": float(round(r2_score(y_test, y_pred), 3)),
        "mae": float(round(mean_absolute_error(y_test, y_pred), 3)),
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
    }

    # Useful stats for inference (for scaling sucrose/CRS, ranges, medians)
    stats = {
        "yield_min": float(y.min()),
        "yield_max": float(y.max()),
        "yield_median": float(y.median()),
    }

    # For nutrient range derivation, find medians and percentiles if columns exist
    for nutrient in ("nitrogen", "phosphorus", "potassium"):
        if nutrient in X.columns:
            arr = X[nutrient].astype(float)
            stats[f"{nutrient}_median"] = float(arr.median())
            stats[f"{nutrient}_p10"] = float(np.percentile(arr, 10))
            stats[f"{nutrient}_p90"] = float(np.percentile(arr, 90))
            stats[f"{nutrient}_min"] = float(arr.min())
            stats[f"{nutrient}_max"] = float(arr.max())

    meta = {
        "features": features,
        "df_num": df_num,
        "metrics": metrics,
        "stats": stats,
        "encoder": encoder,
    }

    pd.to_pickle(model, MODEL_PATH)
    pd.to_pickle(meta, META_PATH)

    return model, meta


# ---------------------
# Inference helpers
# ---------------------
def camel_to_snake(name: str) -> str:
    """Convert camelCase to snake_case"""
    import re
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()


def preprocess_input(user_input: Dict[str, Any], df_num: pd.DataFrame, features: List[str]) -> pd.Series:
    """
    Build a feature vector (Series) aligned with `features`.
    - For one-hot columns named 'col__value', set to 1.0 if user_input[col] matches value (stringified).
    - Numeric features take value from user_input or median from df_num.
    - Handles both camelCase (from frontend) and snake_case (from dataset) field names.
    """
    # Normalize input keys: convert camelCase to snake_case and create lookup
    normalized_input = {}
    for key, value in user_input.items():
        # Skip non-feature fields
        if key in ["createdAt"]:
            continue
        snake_key = camel_to_snake(key)
        normalized_input[snake_key] = value
        # Also keep original for direct matches
        normalized_input[key] = value
    
    row = pd.Series(index=features, dtype=float)
    for col in features:
        # Try direct match first
        if col in normalized_input and pd.api.types.is_number(normalized_input[col]):
            row[col] = float(normalized_input[col])
        elif col in normalized_input and not pd.api.types.is_number(normalized_input[col]):
            try:
                row[col] = float(normalized_input[col])
            except Exception:
                row[col] = df_num[col].median() if col in df_num.columns and pd.api.types.is_numeric_dtype(df_num[col]) else 0.0
        elif "__" in col:
            orig, val = col.split("__", 1)
            # Try both camelCase and snake_case versions
            provided = normalized_input.get(orig) or normalized_input.get(camel_to_snake(orig))
            if provided is None:
                # Try reverse lookup: if orig is snake_case, try camelCase
                # This is a simple heuristic - may need refinement
                for key in normalized_input:
                    if camel_to_snake(key) == orig:
                        provided = normalized_input[key]
                        break
            row[col] = 1.0 if (provided is not None and str(provided).strip().lower() == str(val).strip().lower()) else 0.0
        elif col in df_num.columns and pd.api.types.is_numeric_dtype(df_num[col]):
            row[col] = df_num[col].median()
        else:
            row[col] = 0.0
    return row


def derive_nutrient_ranges(df_num: pd.DataFrame, stats: Dict[str, Any]) -> Tuple[List[int], List[int], List[int]]:
    """
    Create reasonable coarse ranges for N/P/K search using dataset percentiles and medians.
    Returns (Ns, Ps, Ks) as lists of ints.
    """
    def make_range(median, p10, p90, absolute_min=0, absolute_max=None, step=25, expand=1.5):
        if absolute_max is None:
            absolute_max = max(median * expand + 10, p90 + 10)
        low = max(absolute_min, int(max(0, p10 - (median * 0.5))))
        high = int(min(absolute_max, p90 + int(median * 0.5) + 10))
        if high <= low:
            high = int(low + step * 4)
        return list(range(low, high + 1, step))

    Ns = list(range(0, 201, 25))
    Ps = list(range(0, 101, 25))
    Ks = list(range(0, 201, 25))

    # try to use dataset stats if available to produce narrower ranges
    try:
        if "nitrogen_median" in stats and "phosphorus_median" in stats and "potassium_median" in stats:
            Ns = make_range(stats["nitrogen_median"], stats["nitrogen_p10"], stats["nitrogen_p90"], 0, None, step=25)
            Ps = make_range(stats["phosphorus_median"], stats["phosphorus_p10"], stats["phosphorus_p90"], 0, None, step=25)
            Ks = make_range(stats["potassium_median"], stats["potassium_p10"], stats["potassium_p90"], 0, None, step=25)
    except Exception:
        # keep defaults if anything fails
        pass

    # ensure uniqueness & sorted
    Ns = sorted(set(Ns))
    Ps = sorted(set(Ps))
    Ks = sorted(set(Ks))
    return Ns, Ps, Ks


def recommend_npk(
    sample: Dict[str, Any],
    model: RandomForestRegressor,
    features: List[str],
    df_num: pd.DataFrame,
    stats: Dict[str, Any],
) -> List[Tuple[int, int, int, float]]:
    """
    Two-stage search: coarse grid using percentiles, then fine search around best.
    Returns top 5 (n, p, k, predicted_yield).
    """
    base = preprocess_input(sample, df_num, features)
    best_candidates: List[Tuple[int, int, int, float]] = []

    def predict_combo(n: int, p: int, k: int) -> float:
        row = base.copy()
        if "nitrogen" in row.index:
            row["nitrogen"] = float(n)
        if "phosphorus" in row.index:
            row["phosphorus"] = float(p)
        if "potassium" in row.index:
            row["potassium"] = float(k)
        arr = row.values.reshape(1, -1)
        return float(model.predict(arr)[0])

    Ns, Ps, Ks = derive_nutrient_ranges(df_num, stats)

    # coarse search
    coarse: List[Tuple[int, int, int, float]] = []
    for n in Ns:
        for p in Ps:
            for k in Ks:
                try:
                    coarse.append((n, p, k, predict_combo(n, p, k)))
                except Exception:
                    # skip invalid combos if model can't predict
                    continue
    coarse = sorted(coarse, key=lambda x: -x[3])[:8]  # keep top 8 coarse
    if not coarse:
        return []

    best_n, best_p, best_k, _ = coarse[0]

    # fine search around best
    fine_N = range(max(0, best_n - 20), min(int(stats.get("nitrogen_max", 200)), best_n + 20) + 1, 5)
    fine_P = range(max(0, best_p - 10), min(int(stats.get("phosphorus_max", 100)), best_p + 10) + 1, 5)
    fine_K = range(max(0, best_k - 20), min(int(stats.get("potassium_max", 200)), best_k + 20) + 1, 5)

    for n in fine_N:
        for p in fine_P:
            for k in fine_K:
                try:
                    best_candidates.append((n, p, k, predict_combo(n, p, k)))
                except Exception:
                    continue

    top = sorted(best_candidates, key=lambda x: -x[3])[:5]
    return top


def sensitivity_analysis(
    user_input: Dict[str, Any],
    model: RandomForestRegressor,
    df_num: pd.DataFrame,
    features: List[str],
    stats: Dict[str, Any],
) -> List[Dict[str, float]]:
    params = ["temperature", "rainfall", "humidity", "moisture", "nitrogen", "phosphorus", "potassium"]
    base = preprocess_input(user_input, df_num, features)
    base_pred = float(model.predict(pd.DataFrame([base], columns=base.index))[0])
    changes = []
    for param in params:
        if param not in base.index:
            continue
        test_row = base.copy()
        current = float(test_row[param])
        if current != 0:
            delta = current * 0.1
        else:
            # fallback to median from stats/df_num
            if param in df_num.columns and pd.api.types.is_numeric_dtype(df_num[param]):
                delta = 0.1 * float(df_num[param].median())
            else:
                delta = 0.1  # minimal increment
        test_row[param] = current + delta
        try:
            new_pred = float(model.predict(pd.DataFrame([test_row], columns=test_row.index))[0])
            changes.append({"parameter": param, "delta": round(new_pred - base_pred, 3)})
        except Exception:
            changes.append({"parameter": param, "delta": 0.0})
    return changes


def sucrose_and_crs_from_yield(pred_yield: float, stats: Dict[str, Any]) -> Tuple[float, float]:
    """
    Map predicted yield to a reasonable sucrose level and CRS using a linear scaling
    between observed yield min/max in the dataset -> sucrose range (9.5, 20.0).
    This prevents unrealistic sucrose when model yields are in a different scale than expected.
    """
    y_min = float(stats.get("yield_min", pred_yield - 10))
    y_max = float(stats.get("yield_max", pred_yield + 10))
    # avoid division by zero
    if y_max <= y_min:
        y_min = pred_yield - 5
        y_max = pred_yield + 5

    # linear map yield -> sucrose in [9.5, 20.0]
    sucrose_min, sucrose_max = 9.5, 20.0
    # clamp pred_yield
    clipped = max(y_min, min(pred_yield, y_max))
    frac = (clipped - y_min) / (y_max - y_min)
    sucrose = sucrose_min + frac * (sucrose_max - sucrose_min)
    sucrose = float(round(sucrose, 2))
    crs = float(round(max(7.5, min(16.0, sucrose * 0.85)), 2))
    return sucrose, crs


# ---------------------
# Main
# ---------------------
def run_inference() -> Dict[str, Any]:
    try:
        payload = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError as exc:
        raise ValueError("Invalid JSON payload") from exc

    model, meta = train_model()
    df_num: pd.DataFrame = meta["df_num"]
    features: List[str] = meta["features"]
    stats: Dict[str, Any] = meta.get("stats", {})

    # Build input vector
    row = preprocess_input(payload, df_num, features)

    # Ensure ordering matches training features
    X_in = pd.DataFrame([row.values], columns=row.index)

    # Predict yield
    predicted_yield = float(model.predict(X_in.values)[0])
    # clamp negative predictions to zero
    if predicted_yield < 0:
        predicted_yield = 0.0

    top_npk = recommend_npk(payload, model, features, df_num, stats)
    sensitivity = sensitivity_analysis(payload, model, df_num, features, stats)
    sucrose, crs = sucrose_and_crs_from_yield(predicted_yield, stats)

    result = {
        "predictedYield": round(predicted_yield, 2),
        "topNpk": [
            {"n": int(n), "p": int(p), "k": int(k), "yield": round(pred, 2)} for n, p, k, pred in top_npk
        ],
        "sucrose": sucrose,
        "crs": crs,
        "sensitivities": sensitivity,
        "modelMetrics": meta["metrics"],
        "notes": "Sucrose/CRS scaled from dataset yield min/max to keep values realistic.",
    }

    return result


def main():
    try:
        result = run_inference()
        sys.stdout.write(json.dumps(result))
        sys.stdout.flush()
    except Exception as exc:  # CLI guard
        import traceback
        error_msg = str(exc)
        traceback_str = traceback.format_exc()
        error = {
            "error": error_msg,
            "traceback": traceback_str if __name__ == "__main__" else None
        }
        sys.stdout.write(json.dumps(error))
        sys.stdout.flush()
        sys.exit(1)


if __name__ == "__main__":
    main()
