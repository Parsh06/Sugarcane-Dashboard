import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PredictionRecord } from "@/types/prediction"
import { Leaf } from "lucide-react"

export function PredictionHistory({ history }: { history: PredictionRecord[] }) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prediction History</CardTitle>
          <CardDescription>Previous runs will appear here once you analyze multiple fields.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-muted p-4 text-sm text-muted-foreground">
            <Leaf className="h-5 w-5 text-emerald-500" aria-hidden="true" />
            Capture at least one run to build your field notebook.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prediction History</CardTitle>
        <CardDescription>Most recent 5 runs with estimated yield & sugar values.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.map((record) => (
          <div
            key={record.id}
            className="rounded-2xl border border-muted/70 bg-muted/30 p-4 transition hover:border-emerald-300 hover:bg-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{record.input.soilType}</span>
              <span>{record.input.season}</span>
              <span>{new Date(record.input.createdAt).toLocaleString()}</span>
            </div>
            <div className="mt-3 grid gap-3 text-sm md:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Yield</p>
                <p className="font-semibold text-foreground">{record.prediction.predictedYield} t/acre</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sucrose</p>
                <p className="font-semibold text-foreground">{record.prediction.sucrose}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">CRS</p>
                <p className="font-semibold text-foreground">{record.prediction.crs}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Area</p>
                <p className="font-semibold text-foreground">{record.input.area} acre</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}


