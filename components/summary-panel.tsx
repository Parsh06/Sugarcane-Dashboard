"use client"

type Props = {
  soilScore: number
  waterScore: number
  fertScore: number
  rainScore: number
  composite: number
}

export function SummaryPanel({ soilScore, waterScore, fertScore, rainScore, composite }: Props) {
  const metrics = [
    { key: "Soil", value: soilScore, color: "bg-emerald-600" },
    { key: "Water", value: waterScore, color: "bg-emerald-600" },
    { key: "Fertilizer", value: fertScore, color: "bg-amber-500" },
    { key: "Rain", value: rainScore, color: "bg-emerald-600" },
  ]
  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        Composite score: <span className="font-semibold text-gray-900">{composite}/100</span>
      </div>
      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.key}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{m.key}</span>
              <span className="text-gray-900 font-medium">{m.value}</span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full ${m.color}`}
                style={{ width: `${Math.max(0, Math.min(100, m.value))}%` }}
                aria-label={`${m.key} score ${m.value}`}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">Scores are indicative for UI preview only and not agronomic advice.</p>
    </div>
  )
}
