import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FarmerInputSnapshot, PredictionResult } from "@/types/prediction"

type Props = {
  input?: FarmerInputSnapshot | null
  prediction?: PredictionResult | null
}

export function ActionGuide({ input, prediction }: Props) {
  const topMix = prediction?.topNpk?.[0]
  return (
    <Card>
      <CardHeader>
        <CardTitle>What should I do next?</CardTitle>
        <CardDescription>Plain-language steps based on your latest run.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <ol className="space-y-3 pl-5">
          <li>
            <span className="font-semibold text-foreground">Confirm field vitals.</span>{" "}
            {input ? (
              <>
                Soil <span className="text-foreground">{input.soilType}</span>, season{" "}
                <span className="text-foreground">{input.season}</span>, moisture{" "}
                <span className="text-foreground">{input.moisture}%</span>. Keep these updated if
                conditions change.
              </>
            ) : (
              <>Fill the form on the left to capture your latest field readings.</>
            )}
          </li>
          <li>
            <span className="font-semibold text-foreground">Plan fertilizer doses.</span>{" "}
            {topMix ? (
              <>
                Try <span className="text-foreground">N {topMix.n} / P {topMix.p} / K {topMix.k}</span>{" "}
                for an estimated <span className="text-foreground">{topMix.yield.toFixed(2)} t/acre</span>.
                Use the table below if you need alternatives.
              </>
            ) : (
              <>Once predictions are generated, you’ll see a suggested NPK split here.</>
            )}
          </li>
          <li>
            <span className="font-semibold text-foreground">Monitor the most sensitive factors.</span>{" "}
            {prediction?.sensitivities?.length ? (
              <>
                {prediction.sensitivities
                  .slice(0, 2)
                  .map((item) => item.parameter)
                  .join(" & ")}{" "}
                currently move yield the most—adjust irrigation or nutrients there first.
              </>
            ) : (
              <>Run a prediction to learn which parameter changes have the biggest impact.</>
            )}
          </li>
        </ol>
        <p className="rounded-lg border border-muted bg-muted/60 px-3 py-2 text-xs text-foreground">
          Tip: share this panel with a field officer—the inputs plus the suggested NPK mix are usually
          enough for a quick advisory call.
        </p>
      </CardContent>
    </Card>
  )
}


