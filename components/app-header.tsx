import { Sprout } from "lucide-react"

export function AppHeader() {
  return (
    <header className="border-b border-emerald-200/50 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white shadow-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center px-4 py-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-xl ring-2 ring-white/20">
            <Sprout className="h-7 w-7 text-white" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-bold tracking-tight drop-shadow-sm">गन्ना लाभ</p>
            <p className="text-xs opacity-95 font-semibold">Ganna Laabh — Sugarcane Analysis</p>
          </div>
        </div>
      </div>
    </header>
  )
}
