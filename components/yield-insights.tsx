import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PredictionResult } from "@/types/prediction"

export function YieldInsights({ prediction }: { prediction: PredictionResult | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Predictions</CardTitle>
        <CardDescription>Easy-to-read outputs straight from the trained model.</CardDescription>
      </CardHeader>
      <CardContent>
        {prediction ? (
          <InsightsContent data={prediction} />
        ) : (
          <p className="text-sm text-muted-foreground">Provide readings to unlock the prediction panel.</p>
        )}
      </CardContent>
    </Card>
  )
}

function InsightsContent({ data }: { data: PredictionResult }) {
  return (
    <div className="space-y-5 text-sm">
      <section className="grid gap-4 md:grid-cols-2">
        <Metric
          label="Predicted Yield"
          sublabel="How much cane you can expect if conditions stay similar."
          value={`${data.predictedYield.toFixed(2)} t/acre`}
        />
        <Metric
          label="Sucrose (optimal NPK)"
          sublabel="Sugar content inside the cane given the recommended fertilizer mix."
          value={`${data.sucrose.toFixed(2)}%`}
        />
        <Metric
          label="Commercial Recoverable Sugar"
          sublabel="Approximate payout metric at the sugar mill."
          value={`${data.crs.toFixed(2)}%`}
        />
        {data.modelMetrics ? (
          <Metric
            label="Model Health"
            sublabel="How well the RandomForest matches historical observations."
            value={`R² ${data.modelMetrics.r2?.toFixed(2) ?? "--"} | MAE ${data.modelMetrics.mae?.toFixed(2) ?? "--"}`}
          />
        ) : null}
      </section>
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-medium text-foreground">Top 5 fertilizer mixes</p>
          <Badge variant="secondary">Highest yield first</Badge>
        </div>
        <ol className="list-decimal space-y-2 rounded-2xl border border-border/70 bg-muted/40 p-4 text-muted-foreground">
          {data.topNpk.map((combo) => (
            <li key={`${combo.n}-${combo.p}-${combo.k}`} className="text-xs text-foreground">
              <span className="font-semibold text-sm text-foreground">
                N {combo.n} / P {combo.p} / K {combo.k}
              </span>{" "}
              → {combo.yield.toFixed(2)} t/acre
              {combo === data.topNpk[0] ? (
                <Badge className="ml-2 bg-emerald-500/90 text-white" variant="default">
                  Best match
                </Badge>
              ) : null}
              <p className="text-muted-foreground">
                Apply in split doses around rainfall events to match uptake.
              </p>
            </li>
          ))}
        </ol>
      </section>
      {/* Sensitivity section intentionally removed for a simpler read */}
    </div>
  )
}

function Metric({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {sublabel ? <p className="text-[0.72rem] text-muted-foreground/80">{sublabel}</p> : null}
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

