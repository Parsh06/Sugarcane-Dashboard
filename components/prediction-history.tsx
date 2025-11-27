import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PredictionRecord } from "@/types/prediction"
import { Leaf } from "lucide-react"

export function PredictionHistory({ history }: { history: PredictionRecord[] }) {
  if (history.length === 0) {
    return (
      <Card className="card-elevated border-0 shadow-md">
        <CardHeader className="pb-4 border-b border-emerald-100">
          <CardTitle className="text-xl font-bold">Prediction History</CardTitle>
          <CardDescription>Previous runs will appear here once you analyze multiple fields.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-sm text-muted-foreground">
            <Leaf className="h-6 w-6 text-emerald-500" aria-hidden="true" />
            <span className="font-medium">Capture at least one run to build your field notebook.</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-elevated border-0 shadow-lg">
      <CardHeader className="pb-4 border-b border-emerald-100">
        <CardTitle className="text-xl font-bold">Prediction History</CardTitle>
        <CardDescription>Your complete prediction history with estimated yield & sugar values.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {history.map((record, index) => (
          <div
            key={record.id}
            className="rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 p-5 transition-all hover:border-emerald-300 hover:shadow-md hover:scale-[1.01]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                  {index + 1}
                </span>
                <span className="font-semibold text-foreground">{record.input.soilType}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-700 font-medium">{record.input.season}</span>
                <span>{new Date(record.input.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="grid gap-4 text-sm md:grid-cols-4">
              <div className="rounded-lg bg-white/60 p-3 border border-emerald-100">
                <p className="text-xs font-medium text-muted-foreground mb-1">Yield</p>
                <p className="font-bold text-lg text-emerald-700">{record.prediction.predictedYield.toFixed(2)} t/hectare</p>
              </div>
              <div className="rounded-lg bg-white/60 p-3 border border-emerald-100">
                <p className="text-xs font-medium text-muted-foreground mb-1">Sucrose</p>
                <p className="font-bold text-lg text-emerald-700">{record.prediction.sucrose.toFixed(2)}%</p>
              </div>
              <div className="rounded-lg bg-white/60 p-3 border border-emerald-100">
                <p className="text-xs font-medium text-muted-foreground mb-1">CRS</p>
                <p className="font-bold text-lg text-emerald-700">{record.prediction.crs.toFixed(2)}%</p>
              </div>
              <div className="rounded-lg bg-white/60 p-3 border border-emerald-100">
                <p className="text-xs font-medium text-muted-foreground mb-1">Area</p>
                <p className="font-bold text-lg text-emerald-700">{record.input.area} hectares</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}


