import { Leaf } from "lucide-react"

export function AppHeader() {
  return (
    <header className="border-b border-transparent bg-primary text-primary-foreground">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-foreground/10">
            <Leaf className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">गन्ना लाभ</p>
            <p className="text-xs opacity-80">Ganna Laabh</p>
          </div>
        </div>
        <nav aria-label="Top" className="flex items-center gap-3">
          <a
            href="#"
            className="text-xs font-medium opacity-90 transition-colors hover:opacity-100"
            aria-label="Help and documentation"
          >
            Help
          </a>
          <a
            href="#"
            className="text-xs font-medium opacity-90 transition-colors hover:opacity-100"
            aria-label="About Ganna Laabh"
          >
            About
          </a>
        </nav>
      </div>
    </header>
  )
}
