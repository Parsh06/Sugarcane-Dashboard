import { Leaf } from "lucide-react"

export function Preloader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary">
          <Leaf className="h-6 w-6 animate-spin text-primary-foreground" aria-hidden="true" />
        </span>
        <div className="leading-tight">
          <p className="text-base font-semibold text-foreground">गन्ना लाभ</p>
          <p className="text-xs text-muted-foreground">Preparing fields…</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Loading your dashboard</p>
    </div>
  )
}
