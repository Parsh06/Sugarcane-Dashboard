import { TrendingUp, Droplet, Sparkles, History } from "lucide-react"
import type { PredictionResult } from "@/types/prediction"

const metrics = [
  {
    key: "yield",
    label: "Predicted Yield",
    help: "How much cane you can expect per hectare based on today's inputs.",
    icon: TrendingUp,
    placeholder: "—",
    suffix: "t/hectare",
  },
  {
    key: "sucrose",
    label: "Sucrose (optimal)",
    help: "Sugar percentage inside the cane when using the recommended NPK.",
    icon: Sparkles,
    placeholder: "—",
    suffix: "%",
  },
  {
    key: "crs",
    label: "Commercial Sugar",
    help: "Recoverable sugar after milling; higher means better factory payout.",
    icon: Droplet,
    placeholder: "—",
    suffix: "%",
  },
]

export function HeroStats({
  prediction,
  historyCount,
}: {
  prediction: PredictionResult | null
  historyCount: number
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 p-8 text-white shadow-2xl mb-8">
      <div className="absolute inset-0 opacity-10 mix-blend-soft-light">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_45%)]" />
      </div>
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4 max-w-xl">
          <p className="text-sm uppercase tracking-wider text-white/90 font-semibold">Field Summary</p>
          <h2 className="text-3xl font-bold leading-tight">Simple numbers you can act on today</h2>
          <p className="text-base text-white/90 leading-relaxed">
            Enter soil + weather details on the left. We translate them into predicted harvest, sugar content, and a
            fertilizer plan—no agronomy jargon required.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            const value =
              prediction && metric.key === "yield"
                ? `${prediction.predictedYield.toFixed(2)}`
                : prediction && metric.key === "sucrose"
                  ? `${prediction.sucrose.toFixed(2)}`
                  : prediction && metric.key === "crs"
                    ? `${prediction.crs.toFixed(2)}`
                    : metric.placeholder

            return (
              <div
                key={metric.key}
                className="rounded-2xl border-2 border-white/30 bg-white/15 p-5 text-left backdrop-blur-md transition-all hover:bg-white/25 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center gap-2 text-sm text-white/90 font-medium mb-2">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{metric.label}</span>
                </div>
                <p className="text-3xl font-bold mb-1">
                  {value}
                  <span className="text-lg font-semibold text-white/80"> {metric.suffix}</span>
                </p>
                <p className="text-xs text-white/80 leading-relaxed">{metric.help}</p>
              </div>
            )
          })}
          <div className="rounded-2xl border-2 border-white/30 bg-white/15 p-5 backdrop-blur-md transition-all hover:bg-white/25 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center gap-2 text-sm text-white/90 font-medium mb-2">
              <History className="h-4 w-4" />
              Runs Logged
            </div>
            <p className="text-3xl font-bold">{historyCount}</p>
          </div>
        </div>
      </div>
    </section>
  )
}


