"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { FarmerInputSnapshot } from "@/types/prediction"

export function AnalysisSummary({ data }: { data: FarmerInputSnapshot | null }) {
  const { toast } = useToast()
  const json = data ? JSON.stringify(data, null, 2) : ""

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Input</CardTitle>
            <CardDescription>JSON preview of captured data</CardDescription>
          </div>
          {data ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(json)
                  toast({ title: "Copied", description: "JSON copied to clipboard." })
                } catch {
                  toast({ title: "Copy failed", description: "Please try again." })
                }
              }}
            >
              Copy JSON
            </Button>
          ) : null}
        </div>
        {data ? (
          <p className="text-xs text-muted-foreground">Captured at: {new Date(data.createdAt).toLocaleString()}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        {data ? (
          <pre
            className="max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed text-foreground"
            aria-label="JSON preview"
          >
            {json}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">Fill the form and click “Get Analysis” to see your JSON here.</p>
        )}
      </CardContent>
    </Card>
  )
}
