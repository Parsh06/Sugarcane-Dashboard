import { Sprout, Leaf, TrendingUp } from "lucide-react"

export function Preloader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-br from-emerald-50 via-amber-50/30 to-emerald-100"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-600/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-300/20 to-amber-300/20 blur-3xl animate-pulse delay-500" />
        
        {/* Floating Leaves */}
        <div className="absolute top-20 left-10 animate-bounce delay-300">
          <Leaf className="h-8 w-8 text-emerald-400/40 rotate-12" />
        </div>
        <div className="absolute top-40 right-20 animate-bounce delay-700">
          <Leaf className="h-6 w-6 text-amber-400/40 -rotate-12" />
        </div>
        <div className="absolute bottom-32 left-1/4 animate-bounce delay-1000">
          <Leaf className="h-7 w-7 text-emerald-500/40 rotate-45" />
        </div>
        <div className="absolute bottom-20 right-1/3 animate-bounce delay-500">
          <Leaf className="h-5 w-5 text-amber-500/40 -rotate-45" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo Container */}
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-400/20 to-amber-400/20 blur-2xl animate-pulse" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-2xl ring-4 ring-emerald-200/50">
            <Sprout className="h-12 w-12 text-white animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 shadow-lg">
            <TrendingUp className="h-4 w-4 text-white animate-bounce" />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
            गन्ना लाभ
          </h1>
          <p className="text-lg font-semibold text-emerald-700">Ganna Laabh</p>
          <p className="text-sm text-emerald-600/80 font-medium">Sugarcane Analysis Dashboard</p>
        </div>

        {/* Loading Animation */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-sm font-medium text-emerald-700 animate-pulse">Preparing your fields...</p>
        </div>
      </div>

      {/* Bottom Decorative Elements */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-emerald-600/60">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-400" />
        <span className="font-medium">Loading Dashboard</span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-400" />
      </div>
    </div>
  )
}
