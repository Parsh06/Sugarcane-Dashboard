import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PredictionResult } from "@/types/prediction"

export function YieldInsights({ prediction }: { prediction: PredictionResult | null }) {
  return (
    <Card className="card-elevated border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/20">
      <CardHeader className="pb-4 border-b border-emerald-100">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
          Predictions
        </CardTitle>
        <CardDescription className="text-sm">
          Easy-to-read outputs from sugarcane yield analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {prediction ? (
          <InsightsContent data={prediction} />
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Provide readings to unlock the prediction panel.</p>
          </div>
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
          value={`${data.predictedYield.toFixed(2)} t/hectare`}
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
            label="Model Accuracy"
            sublabel="How well the prediction model matches historical sugarcane cultivation data."
            value={`R² ${data.modelMetrics.r2?.toFixed(2) ?? "--"} | MAE ${data.modelMetrics.mae?.toFixed(2) ?? "--"}`}
          />
        ) : null}
      </section>
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-medium text-foreground">Top 5 fertilizer mixes</p>
          <Badge variant="secondary">Highest yield first</Badge>
        </div>
        <ol className="list-decimal space-y-3 rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 p-5 shadow-sm">
          {data.topNpk.map((combo, index) => (
            <li 
              key={`${combo.n}-${combo.p}-${combo.k}`} 
              className={`text-sm pl-2 ${index === 0 ? 'bg-emerald-50/50 rounded-lg p-3 border border-emerald-200' : ''}`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base text-foreground">
                  N {combo.n} / P {combo.p} / K {combo.k}
                </span>
                <span className="text-emerald-600 font-semibold">→ {combo.yield.toFixed(2)} t/hectare</span>
                {combo === data.topNpk[0] ? (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-sm">
                    Best match
                  </Badge>
                ) : null}
              </div>
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
    <div className="rounded-xl border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 p-4 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">{label}</p>
      {sublabel ? <p className="text-[0.7rem] text-muted-foreground mb-2 leading-relaxed">{sublabel}</p> : null}
      <p className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">{value}</p>
    </div>
  )
}

