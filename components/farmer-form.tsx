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
import { Sprout, Calendar, MapPin, Thermometer, Droplets, Wind, Waves } from "lucide-react"
import type { FarmerInputSnapshot, PredictionResult } from "@/types/prediction"

const SOIL_TYPES = ["Loamy", "Clay", "Sandy", "Red"]
const SEASONS = ["Kharif", "Rabi", "Summer"]

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

    const missingFields: string[] = []
    if (!soilType) missingFields.push("Soil Type")
    if (!season) missingFields.push("Season")
    if (!parsedArea || parsedArea <= 0) missingFields.push("Cultivated Area")
    if (!parsedTemp || parsedTemp <= 0) missingFields.push("Temperature")
    if (!parsedRain || parsedRain < 0) missingFields.push("Rainfall")
    if (!parsedHumidity || parsedHumidity < 0 || parsedHumidity > 100) missingFields.push("Humidity")
    if (!parsedMoisture || parsedMoisture < 0 || parsedMoisture > 100) missingFields.push("Soil Moisture")

    if (missingFields.length > 0) {
      toast({
        title: "Missing or invalid fields",
        description: `Please fill all required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
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
        description: "Sugarcane yield predictions have been generated successfully.",
      })
    } catch (error) {
      console.error("Prediction error", error)
      toast({
        title: "Prediction failed",
        description: "Unable to generate predictions. Please check your inputs and try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("grid grid-cols-1 gap-5", className)}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="grid gap-2.5">
          <Label htmlFor="soilType" className="flex items-center gap-2 text-sm font-semibold">
            <Sprout className="h-4 w-4 text-emerald-600" />
            Soil Type <span className="text-red-500">*</span>
          </Label>
          <Select value={soilType} onValueChange={setSoilType} required>
            <SelectTrigger 
              id="soilType" 
              aria-label="Select soil type"
              className={cn(
                "h-11 border-2 transition-all",
                !soilType ? "border-red-200 focus:border-red-400" : "border-emerald-200 focus:border-emerald-400"
              )}
            >
              <SelectValue placeholder="Select soil type" />
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
        <div className="grid gap-2.5">
          <Label htmlFor="season" className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Season <span className="text-red-500">*</span>
          </Label>
          <Select value={season} onValueChange={setSeason} required>
            <SelectTrigger 
              id="season" 
              aria-label="Select season"
              className={cn(
                "h-11 border-2 transition-all",
                !season ? "border-red-200 focus:border-red-400" : "border-emerald-200 focus:border-emerald-400"
              )}
            >
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

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="grid gap-2.5">
          <Label htmlFor="area" className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="h-4 w-4 text-emerald-600" />
            Cultivated Area (hectares) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="area"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g., 3.5"
            value={area}
            required
            onChange={(e) => setArea(e.target.value === "" ? "" : Number(e.target.value))}
            className={cn(
              "h-11 border-2 transition-all",
              (!area || area <= 0) ? "border-red-200 focus:border-red-400" : "border-emerald-200 focus:border-emerald-400"
            )}
          />
        </div>
        <div className="grid gap-2.5">
          <Label htmlFor="temperature" className="flex items-center gap-2 text-sm font-semibold">
            <Thermometer className="h-4 w-4 text-emerald-600" />
            Avg Temperature (°C) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            placeholder="e.g., 27"
            value={temperature}
            required
            onChange={(e) => setTemperature(e.target.value === "" ? "" : Number(e.target.value))}
            className={cn(
              "h-11 border-2 transition-all",
              (!temperature || temperature <= 0) ? "border-red-200 focus:border-red-400" : "border-emerald-200 focus:border-emerald-400"
            )}
          />
        </div>
        <div className="grid gap-2.5">
          <Label htmlFor="rainfall" className="flex items-center gap-2 text-sm font-semibold">
            <Droplets className="h-4 w-4 text-emerald-600" />
            Rainfall (mm) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="rainfall"
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 900"
            value={rainfall}
            required
            onChange={(e) => setRainfall(e.target.value === "" ? "" : Number(e.target.value))}
            className={cn(
              "h-11 border-2 transition-all",
              (!rainfall || rainfall < 0) ? "border-red-200 focus:border-red-400" : "border-emerald-200 focus:border-emerald-400"
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="grid gap-2.5">
          <Label htmlFor="humidity" className="flex items-center gap-2 text-sm font-semibold">
            <Wind className="h-4 w-4 text-emerald-600" />
            Humidity (%) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="humidity"
            type="number"
            min="0"
            max="100"
            step="1"
            placeholder="e.g., 70"
            value={humidity}
            required
            onChange={(e) => setHumidity(e.target.value === "" ? "" : Number(e.target.value))}
            className={cn(
              "h-11 border-2 transition-all",
              (!humidity || humidity < 0 || humidity > 100) ? "border-red-200 focus:border-red-400" : "border-emerald-200 focus:border-emerald-400"
            )}
          />
        </div>
        <div className="grid gap-2.5">
          <Label htmlFor="moisture" className="flex items-center gap-2 text-sm font-semibold">
            <Waves className="h-4 w-4 text-emerald-600" />
            Soil Moisture (%) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="moisture"
            type="number"
            min="0"
            max="100"
            step="1"
            placeholder="e.g., 45"
            value={moisture}
            required
            onChange={(e) => setMoisture(e.target.value === "" ? "" : Number(e.target.value))}
            className={cn(
              "h-11 border-2 transition-all",
              (!moisture || moisture < 0 || moisture > 100) ? "border-red-200 focus:border-red-400" : "border-emerald-200 focus:border-emerald-400"
            )}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="border-2 hover:bg-muted/80 transition-all"
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
        <Button 
          type="submit" 
          aria-label="Get Analysis" 
          disabled={submitting}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed px-6"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Predicting output...
            </span>
          ) : (
            "Get Analysis"
          )}
        </Button>
      </div>
    </form>
  )
}
