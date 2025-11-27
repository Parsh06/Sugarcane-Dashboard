"use client"

import { useEffect, useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Preloader } from "@/components/preloader"
import { FarmerForm } from "@/components/farmer-form"
import { YieldInsights } from "@/components/yield-insights"
import { PredictionHistory } from "@/components/prediction-history"
import { HeroStats } from "@/components/hero-stats"
import { ActionGuide } from "@/components/action-guide"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf } from "lucide-react"
import type { FarmerInputSnapshot, PredictionRecord, PredictionResult } from "@/types/prediction"

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [inputSnapshot, setInputSnapshot] = useState<FarmerInputSnapshot | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [history, setHistory] = useState<PredictionRecord[]>([])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return <Preloader />
  }

  return (
    <>
      <AppHeader />
      <main className="relative mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
        <DecorativeBackground />
        <HeroStats prediction={prediction} historyCount={history.length} />
        <section aria-label="Intro" className="mb-6 md:mb-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-balance text-2xl font-semibold text-gray-900 md:text-3xl">गन्ना लाभ — Ganna Laabh</h1>
              <p className="text-pretty text-sm text-gray-600 md:text-base">
                Enter your field vitals to estimate yield and sugar metrics, then review the JSON payload for downstream
                integrations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-500 text-white hover:bg-amber-600">Beta</Badge>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                <Leaf className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span className="text-xs text-gray-700">Focused on Sugarcane</span>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Dashboard" className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr,1fr]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Field Conditions</CardTitle>
                <CardDescription>Provide current soil and climate readings to generate quick predictions.</CardDescription>
              </CardHeader>
              <CardContent>
                <FarmerForm
                  onAnalyze={(input, result) => {
                    setInputSnapshot(input)
                    setPrediction(result)
                    setHistory((prev) => {
                      const next = [{ id: input.createdAt, input, prediction: result }, ...prev]
                      return next.slice(0, 5)
                    })
                  }}
                />
              </CardContent>
            </Card>

            <ActionGuide input={inputSnapshot} prediction={prediction} />
          </div>

          <div className="flex flex-col gap-6">
            {inputSnapshot ? (
              <Card>
                <CardHeader>
                  <CardTitle>At a glance</CardTitle>
                  <CardDescription>Key selections from your input</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Area</p>
                      <p className="font-medium text-foreground">
                        {inputSnapshot.area} acre
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Soil</p>
                      <p className="font-medium text-foreground">{inputSnapshot.soilType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Season</p>
                      <p className="font-medium text-foreground">{inputSnapshot.season}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Temperature</p>
                      <p className="font-medium text-foreground">{inputSnapshot.temperature} °C</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rainfall</p>
                      <p className="font-medium text-foreground">{inputSnapshot.rainfall} mm</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Humidity</p>
                      <p className="font-medium text-foreground">{inputSnapshot.humidity}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Moisture</p>
                      <p className="font-medium text-foreground">{inputSnapshot.moisture}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <YieldInsights prediction={prediction} />
          </div>
        </section>

        <section aria-label="History" className="mt-6">
          <PredictionHistory history={history} />
        </section>
      </main>
    </>
  )
}

function DecorativeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-200/60 via-white to-transparent blur-3xl" />
      <div className="absolute right-10 top-10 h-32 w-32 rounded-full bg-emerald-300/40 blur-3xl" />
      <div className="absolute left-0 top-20 h-24 w-24 rounded-full bg-amber-200/50 blur-3xl" />
    </div>
  )
}
