"""
Prediction service for the Sugarcane dashboard.

This script mirrors the preprocessing / modeling logic from the user's Colab
notebook so that the Next.js app can call it through a lightweight CLI.

Input  (stdin):  JSON payload with the user form values.
Output (stdout): JSON payload with predicted yield, sucrose/CRS projection,
                 top 5 NPK combinations, and sensitivity deltas.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "dataset" / "finalSugarcaneDataset_cleaned.csv"
ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = ARTIFACT_DIR / "rf_model.pkl"
META_PATH = ARTIFACT_DIR / "meta.pkl"

# ----------------------------------------------------------------------------------------------------------------------
# Data preparation helpers (mirrors the notebook)


def load_dataset() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")
    return pd.read_csv(DATA_PATH)


def preprocess_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    thresh = int(0.5 * len(df))
    df = df.loc[:, df.isna().sum() < thresh].copy()

    for col in df.select_dtypes(include=[np.number]).columns:
        df[col] = df[col].fillna(df[col].median())

    for col in df.select_dtypes(include="object").columns:
        try:
            df[col] = df[col].fillna(df[col].mode().iloc[0])
        except Exception:
            df[col] = df[col].fillna("unknown")

    obj_cols = df.select_dtypes(include="object").columns.tolist()
    cat_cols = [c for c in obj_cols if df[c].nunique() <= 50 and c.lower() != "date"]

    if cat_cols:
        encoder = OneHotEncoder(handle_unknown="ignore")
        encoded = encoder.fit_transform(df[cat_cols]).toarray()
        oh_cols = [f"{col}__{val}" for i, col in enumerate(cat_cols) for val in encoder.categories_[i]]
        oh_df = pd.DataFrame(encoded, columns=oh_cols, index=df.index)
        df_num = pd.concat([df.drop(columns=cat_cols), oh_df], axis=1)
    else:
        encoder = None
        df_num = df

    for col in df_num.columns:
        if df_num[col].isna().any():
            if pd.api.types.is_numeric_dtype(df_num[col]):
                df_num[col] = df_num[col].fillna(df_num[col].median())
            else:
                df_num[col] = df_num[col].fillna(0)

    return df_num


def train_model(force: bool = False) -> Tuple[RandomForestRegressor, Dict[str, Any]]:
    if MODEL_PATH.exists() and META_PATH.exists() and not force:
        model = pd.read_pickle(MODEL_PATH)
        meta = pd.read_pickle(META_PATH)
        return model, meta

    df = load_dataset()
    df_num = preprocess_dataframe(df)

    target = "crop_yield"
    if target not in df_num.columns:
        raise ValueError("Expected 'crop_yield' column in dataset.")

    X = df_num.drop(columns=[target])
    y = df_num[target]

    date_cols = [c for c in X.columns if "date" in c.lower()]
    if date_cols:
        X = X.drop(columns=date_cols)

    features = X.columns.tolist()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    metrics = {
        "r2": float(round(r2_score(y_test, y_pred), 3)),
        "mae": float(round(mean_absolute_error(y_test, y_pred), 3)),
    }

    meta = {
        "features": features,
        "df_num": df_num,
        "metrics": metrics,
    }

    pd.to_pickle(model, MODEL_PATH)
    pd.to_pickle(meta, META_PATH)

    return model, meta


# ----------------------------------------------------------------------------------------------------------------------
# Inference helpers

def preprocess_input(user_input: Dict[str, Any], df_num: pd.DataFrame, features: List[str]) -> pd.Series:
    row = pd.Series(index=features, dtype=float)
    for col in features:
        if col in user_input:
            row[col] = user_input[col]
        elif "__" in col:
            orig, val = col.split("__", 1)
            row[col] = 1.0 if (orig in user_input and str(user_input[orig]) == val) else 0.0
        elif col in df_num.columns:
            row[col] = (
                df_num[col].median() if pd.api.types.is_numeric_dtype(df_num[col]) else 0.0
            )
        else:
            row[col] = 0.0
    return row


def recommend_npk(
    sample: Dict[str, Any],
    model: RandomForestRegressor,
    features: List[str],
    df_num: pd.DataFrame,
) -> List[Tuple[int, int, int, float]]:
    base = preprocess_input(sample, df_num, features)
    best_candidates: List[Tuple[int, int, int, float]] = []

    def predict_combo(n: int, p: int, k: int) -> float:
        row = base.copy()
        if "nitrogen" in row.index:
            row["nitrogen"] = n
        if "phosphorus" in row.index:
            row["phosphorus"] = p
        if "potassium" in row.index:
            row["potassium"] = k
        return float(model.predict(row.values.reshape(1, -1))[0])

    Ns = range(0, 201, 25)
    Ps = range(0, 101, 25)
    Ks = range(0, 201, 25)

    coarse: List[Tuple[int, int, int, float]] = []
    for n in Ns:
        for p in Ps:
            for k in Ks:
                coarse.append((n, p, k, predict_combo(n, p, k)))
    coarse = sorted(coarse, key=lambda x: -x[3])[:5]
    best_n, best_p, best_k, _ = coarse[0]

    fine_N = range(max(0, best_n - 20), min(200, best_n + 20) + 1, 5)
    fine_P = range(max(0, best_p - 10), min(100, best_p + 10) + 1, 5)
    fine_K = range(max(0, best_k - 20), min(200, best_k + 20) + 1, 5)

    for n in fine_N:
        for p in fine_P:
            for k in fine_K:
                best_candidates.append((n, p, k, predict_combo(n, p, k)))

    top = sorted(best_candidates, key=lambda x: -x[3])[:5]
    return top


def sensitivity_analysis(
    user_input: Dict[str, Any],
    model: RandomForestRegressor,
    df_num: pd.DataFrame,
    features: List[str],
) -> List[Dict[str, float]]:
    params = ["temperature", "rainfall", "humidity", "moisture", "nitrogen", "phosphorus", "potassium"]
    base = preprocess_input(user_input, df_num, features)
    base_pred = float(model.predict(pd.DataFrame([base], columns=base.index))[0])
    changes = []
    for param in params:
        if param not in base.index:
            continue
        test_row = base.copy()
        current = test_row[param]
        if current != 0:
            delta = current * 0.1
        else:
            delta = 0.1 * (df_num[param].median() if param in df_num.columns else 1)
        test_row[param] = current + delta
        new_pred = float(model.predict(pd.DataFrame([test_row], columns=test_row.index))[0])
        changes.append({"parameter": param, "delta": round(new_pred - base_pred, 3)})
    return changes


def sucrose_from_yield(pred_yield: float) -> float:
    sucrose = 12 + (pred_yield - 55) / 18
    return float(round(max(9.5, min(20.0, sucrose)), 2))


def crs_from_sucrose(sucrose: float) -> float:
    return float(round(max(7.5, min(16.0, sucrose * 0.85)), 2))


# ----------------------------------------------------------------------------------------------------------------------
# Main entry point


def run_inference() -> Dict[str, Any]:
    try:
        payload = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError as exc:
        raise ValueError("Invalid JSON payload") from exc

    model, meta = train_model()
    df_num: pd.DataFrame = meta["df_num"]
    features: List[str] = meta["features"]

    row = preprocess_input(payload, df_num, features)
    predicted_yield = float(model.predict(pd.DataFrame([row], columns=row.index))[0])
    top_npk = recommend_npk(payload, model, features, df_num)
    sensitivity = sensitivity_analysis(payload, model, df_num, features)
    sucrose = sucrose_from_yield(predicted_yield)
    crs = crs_from_sucrose(sucrose)

    return {
        "predictedYield": round(predicted_yield, 2),
        "topNpk": [
            {"n": int(n), "p": int(p), "k": int(k), "yield": round(pred, 2)} for n, p, k, pred in top_npk
        ],
        "sucrose": sucrose,
        "crs": crs,
        "sensitivities": sensitivity,
        "modelMetrics": meta["metrics"],
    }


def main():
    try:
        result = run_inference()
        sys.stdout.write(json.dumps(result))
    except Exception as exc:  # pragma: no cover - CLI guard
        error = {"error": str(exc)}
        sys.stdout.write(json.dumps(error))
        sys.exit(1)


if __name__ == "__main__":
    main()


