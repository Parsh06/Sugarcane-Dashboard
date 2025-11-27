"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FarmerInputSnapshot, PredictionResult } from "@/types/prediction"

type Props = {
  prediction: PredictionResult | null
  input: FarmerInputSnapshot | null
}

export function PredictionCharts({ prediction, input }: Props) {
  if (!prediction || !input) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visual Breakdown</CardTitle>
          <CardDescription>Charts will appear once you run the analysis.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Submit the field form to unlock fertilizer comparisons and parameter profiles.
        </CardContent>
      </Card>
    )
  }

  const npkData = prediction.topNpk.map((combo, index) => ({
    name: `Mix ${index + 1}`,
    label: `N${combo.n}/P${combo.p}/K${combo.k}`,
    yield: Number(combo.yield.toFixed(2)),
  }))

  const radarParameters = [
    { key: "temperature", label: "Temp (°C)", value: input.temperature, max: 45 },
    { key: "rainfall", label: "Rainfall (mm)", value: input.rainfall, max: 400 },
    { key: "humidity", label: "Humidity %", value: input.humidity, max: 100 },
    { key: "moisture", label: "Soil moisture %", value: input.moisture, max: 100 },
  ].map((param) => ({
    subject: param.label,
    value: Math.min(param.value, param.max),
    fullMark: param.max,
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Yield vs NPK mix</CardTitle>
          <CardDescription>The taller the bar, the better the estimated harvest.</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={npkData} margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: "0.75rem" }} />
              <Bar dataKey="yield" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Field condition profile</CardTitle>
          <CardDescription>Shows how current vitals compare within common ranges.</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarParameters}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar
                name="Current"
                dataKey="value"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}


