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
    const loadHistory = async () => {
      try {
        const response = await fetch("/api/history")
        if (response.ok) {
          const data = await response.json()
          setHistory(data)
          if (data.length > 0) {
            const latest = data[0]
            setInputSnapshot(latest.input)
            setPrediction(latest.prediction)
          }
        }
      } catch (error) {
        console.error("Failed to load history:", error)
      } finally {
        setTimeout(() => setLoading(false), 800)
      }
    }
    loadHistory()
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
        <section aria-label="Intro" className="mb-8 md:mb-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="text-balance text-3xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent md:text-4xl">
                गन्ना लाभ — Ganna Laabh
              </h1>
              <p className="text-pretty text-sm text-muted-foreground md:text-base max-w-2xl">
                Enter your field vitals to estimate yield and sugar metrics. Get intelligent insights tailored to your specific sugarcane cultivation conditions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-sm hover:shadow-md transition-shadow">
                Beta
              </Badge>
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-amber-50 px-4 py-2.5 shadow-sm">
                <Leaf className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span className="text-xs font-medium text-emerald-900">Sugarcane Focused</span>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Dashboard" className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr,1fr]">
          <div className="flex flex-col gap-6">
            <Card className="card-elevated border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Field Conditions</CardTitle>
                <CardDescription className="text-sm">
                  Provide current soil and climate readings to generate quick predictions. All fields marked with <span className="text-red-500 font-semibold">*</span> are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FarmerForm
                  onAnalyze={async (input, result) => {
                    setInputSnapshot(input)
                    setPrediction(result)
                    const newRecord: PredictionRecord = {
                      id: input.createdAt,
                      input,
                      prediction: result,
                    }
                    try {
                      await fetch("/api/history", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newRecord),
                      })
                      const response = await fetch("/api/history")
                      if (response.ok) {
                        const updatedHistory = await response.json()
                        setHistory(updatedHistory)
                      }
                    } catch (error) {
                      console.error("Failed to save history:", error)
                    }
                  }}
                />
              </CardContent>
            </Card>

            <ActionGuide input={inputSnapshot} prediction={prediction} />
          </div>

          <div className="flex flex-col gap-6">
            {inputSnapshot ? (
              <Card className="card-elevated border-0 shadow-md bg-gradient-to-br from-white to-emerald-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">At a glance</CardTitle>
                  <CardDescription className="text-xs">Key selections from your input</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-lg bg-white/60 p-3 border border-emerald-100">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Area</p>
                      <p className="font-semibold text-foreground text-base">
                        {inputSnapshot.area} hectares
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-3 border border-emerald-100">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Soil</p>
                      <p className="font-semibold text-foreground text-base">{inputSnapshot.soilType}</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-3 border border-emerald-100">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Season</p>
                      <p className="font-semibold text-foreground text-base">{inputSnapshot.season}</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-3 border border-emerald-100">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Temperature</p>
                      <p className="font-semibold text-foreground text-base">{inputSnapshot.temperature} °C</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-3 border border-emerald-100">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Rainfall</p>
                      <p className="font-semibold text-foreground text-base">{inputSnapshot.rainfall} mm</p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-3 border border-emerald-100">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Humidity</p>
                      <p className="font-semibold text-foreground text-base">{inputSnapshot.humidity}%</p>
                    </div>
                    <div className="col-span-2 rounded-lg bg-white/60 p-3 border border-emerald-100">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Moisture</p>
                      <p className="font-semibold text-foreground text-base">{inputSnapshot.moisture}%</p>
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
      {/* Main Gradient Background */}
      <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-emerald-100/50 via-amber-50/30 to-transparent blur-3xl" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute right-10 top-20 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-300/40 to-emerald-500/20 blur-3xl animate-pulse" />
      <div className="absolute left-0 top-40 h-64 w-64 rounded-full bg-gradient-to-br from-amber-300/40 to-amber-500/20 blur-3xl animate-pulse delay-1000" />
      <div className="absolute bottom-20 right-1/4 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-600/15 blur-2xl animate-pulse delay-500" />
      <div className="absolute top-1/2 left-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-amber-200/30 to-emerald-200/20 blur-3xl animate-pulse delay-700" />
      
      {/* Subtle Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(5, 150, 105) 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }}
      />
      
      {/* Light Rays Effect */}
      <div className="absolute top-0 left-1/4 h-full w-px bg-gradient-to-b from-emerald-300/20 via-transparent to-transparent" />
      <div className="absolute top-0 right-1/3 h-full w-px bg-gradient-to-b from-amber-300/20 via-transparent to-transparent" />
    </div>
  )
}
