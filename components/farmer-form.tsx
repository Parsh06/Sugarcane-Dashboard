"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { FarmerInputSnapshot, PredictionResult } from "@/types/prediction"

const SOIL_TYPES = ["Alluvial", "Black", "Red", "Laterite", "Sandy Loam", "Clay"]
const SEASONS = ["Autumn", "Spring", "Summer", "Monsoon", "Winter"]

export function FarmerForm({
  onAnalyze,
  className,
}: {
  onAnalyze: (input: FarmerInputSnapshot, prediction: PredictionResult) => void
  className?: string
}) {
  const { toast } = useToast()

  const [soilType, setSoilType] = useState("")
  const [season, setSeason] = useState("")
  const [area, setArea] = useState<number | "">("")
  const [temperature, setTemperature] = useState<number | "">("")
  const [rainfall, setRainfall] = useState<number | "">("")
  const [humidity, setHumidity] = useState<number | "">("")
  const [moisture, setMoisture] = useState<number | "">("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedArea = typeof area === "string" ? Number.parseFloat(area) : area
    const parsedTemp = typeof temperature === "string" ? Number.parseFloat(temperature) : temperature
    const parsedRain = typeof rainfall === "string" ? Number.parseFloat(rainfall) : rainfall
    const parsedHumidity = typeof humidity === "string" ? Number.parseFloat(humidity) : humidity
    const parsedMoisture = typeof moisture === "string" ? Number.parseFloat(moisture) : moisture

    if (!soilType || !season || !parsedArea || !parsedTemp || !parsedRain || !parsedHumidity || !parsedMoisture) {
      toast({
        title: "Missing details",
        description: "All fields are required to generate predictions.",
      })
      return
    }

    const payload: FarmerInputSnapshot = {
      soilType,
      season,
      area: parsedArea,
      temperature: parsedTemp,
      rainfall: parsedRain,
      humidity: parsedHumidity,
      moisture: parsedMoisture,
      createdAt: new Date().toISOString(),
    }

    console.log("Ganna Laabh — Farmer Input:", JSON.stringify(payload, null, 2))

    try {
      setSubmitting(true)
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Prediction service returned an error.")
      }

      const prediction: PredictionResult = await response.json()
      onAnalyze(payload, prediction)

      toast({
        title: "Analysis ready",
        description: "Insights updated with live model predictions.",
      })
    } catch (error) {
      console.error("Prediction error", error)
      toast({
        title: "Prediction failed",
        description: "Unable to reach the model service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("grid grid-cols-1 gap-4", className)}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="soilType">Soil Type</Label>
          <Select value={soilType} onValueChange={setSoilType}>
            <SelectTrigger id="soilType" aria-label="Select soil type">
              <SelectValue placeholder="Select soil" />
            </SelectTrigger>
            <SelectContent>
              {SOIL_TYPES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="season">Season</Label>
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger id="season" aria-label="Select season">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              {SEASONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="area">Cultivated Area (acre)</Label>
          <Input
            id="area"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g., 3.5"
            value={area}
            onChange={(e) => setArea(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="temperature">Avg Temperature (°C)</Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            placeholder="e.g., 27"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rainfall">Rainfall (mm)</Label>
          <Input
            id="rainfall"
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 900"
            value={rainfall}
            onChange={(e) => setRainfall(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="humidity">Humidity (%)</Label>
          <Input
            id="humidity"
            type="number"
            min="0"
            max="100"
            step="1"
            placeholder="e.g., 70"
            value={humidity}
            onChange={(e) => setHumidity(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="moisture">Soil Moisture (%)</Label>
          <Input
            id="moisture"
            type="number"
            min="0"
            max="100"
            step="1"
            placeholder="e.g., 45"
            value={moisture}
            onChange={(e) => setMoisture(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="bg-transparent hover:bg-muted"
          onClick={() => {
            setSoilType("")
            setSeason("")
            setArea("")
            setTemperature("")
            setRainfall("")
            setHumidity("")
            setMoisture("")
          }}
        >
          Reset
        </Button>
        <Button type="submit" aria-label="Get Analysis" disabled={submitting}>
          {submitting ? "Running model..." : "Get Analysis"}
        </Button>
      </div>

      <Card className="mt-2 border-dashed">
        <CardContent className="py-3 text-xs text-muted-foreground">
          Predictions are generated locally via the bundled RandomForest model trained on the provided dataset.
        </CardContent>
      </Card>
    </form>
  )
}
