import { TrendingUp, Droplet, Sparkles, History } from "lucide-react"
import type { PredictionResult } from "@/types/prediction"

const metrics = [
  {
    key: "yield",
    label: "Predicted Yield",
    help: "How much cane you can expect per acre based on today’s inputs.",
    icon: TrendingUp,
    placeholder: "—",
    suffix: "t/acre",
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
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 p-6 text-white shadow-xl">
      <div className="absolute inset-0 opacity-10 mix-blend-soft-light">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_45%)]" />
      </div>
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-white/80">Field summary</p>
          <h2 className="text-2xl font-semibold leading-tight">Simple numbers you can act on today</h2>
          <p className="text-sm text-white/85">
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
                className="rounded-2xl border border-white/25 bg-white/10 p-4 text-left backdrop-blur-sm transition hover:bg-white/20"
              >
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{metric.label}</span>
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {value}
                  <span className="text-base font-medium text-white/70"> {metric.suffix}</span>
                </p>
                <p className="mt-1 text-xs text-white/75">{metric.help}</p>
              </div>
            )
          })}
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition hover:bg-white/15">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <History className="h-4 w-4" />
              Runs Logged
            </div>
            <p className="mt-2 text-2xl font-semibold">{historyCount}</p>
          </div>
        </div>
      </div>
    </section>
  )
}


