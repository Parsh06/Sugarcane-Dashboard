import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FarmerInputSnapshot, PredictionResult } from "@/types/prediction"

type Props = {
  input?: FarmerInputSnapshot | null
  prediction?: PredictionResult | null
}

export function ActionGuide({ input, prediction }: Props) {
  const topMix = prediction?.topNpk?.[0]
  return (
    <Card className="card-elevated border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/20">
      <CardHeader className="pb-4 border-b border-amber-100">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
          What should I do next?
        </CardTitle>
        <CardDescription className="text-sm">
          Plain-language steps based on your latest run.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-6 text-sm">
        <ol className="space-y-4 pl-2">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
              1
            </span>
            <div>
              <span className="font-semibold text-foreground">Confirm field vitals.</span>{" "}
              {input ? (
                <span className="text-muted-foreground">
                  Soil <span className="text-foreground font-medium">{input.soilType}</span>, season{" "}
                  <span className="text-foreground font-medium">{input.season}</span>, moisture{" "}
                  <span className="text-foreground font-medium">{input.moisture}%</span>. Keep these updated if
                  conditions change.
                </span>
              ) : (
                <span className="text-muted-foreground">Fill the form on the left to capture your latest field readings.</span>
              )}
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
              2
            </span>
            <div>
              <span className="font-semibold text-foreground">Plan fertilizer doses.</span>{" "}
              {topMix ? (
                <span className="text-muted-foreground">
                  Try <span className="text-foreground font-medium">N {topMix.n} / P {topMix.p} / K {topMix.k}</span>{" "}
                  for an estimated <span className="text-foreground font-medium">{topMix.yield.toFixed(2)} t/hectare</span>.
                  Use the table below if you need alternatives.
                </span>
              ) : (
                <span className="text-muted-foreground">Once predictions are generated, you'll see a suggested NPK split here.</span>
              )}
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
              3
            </span>
            <div>
              <span className="font-semibold text-foreground">Monitor the most sensitive factors.</span>{" "}
              {prediction?.sensitivities?.length ? (
                <span className="text-muted-foreground">
                  {prediction.sensitivities
                    .slice(0, 2)
                    .map((item) => item.parameter)
                    .join(" & ")}{" "}
                  currently move yield the most—adjust irrigation or nutrients there first.
                </span>
              ) : (
                <span className="text-muted-foreground">Run a prediction to learn which parameter changes have the biggest impact.</span>
              )}
            </div>
          </li>
        </ol>
        <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 px-4 py-3">
          <p className="text-xs font-medium text-amber-900">
            💡 Tip: Share this panel with a field officer—the inputs plus the suggested NPK mix are usually
            enough for a quick advisory call.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}


