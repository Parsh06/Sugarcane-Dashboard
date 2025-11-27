export type PredictionResult = {
  predictedYield: number
  sucrose: number
  crs: number
  topNpk: Array<{ n: number; p: number; k: number; yield: number }>
  sensitivities: Array<{ parameter: string; delta: number }>
  modelMetrics?: { r2: number; mae: number }
}

export type PredictionRecord = {
  id: string
  input: FarmerInputSnapshot
  prediction: PredictionResult
}

export type FarmerInputSnapshot = {
  soilType: string
  season: string
  area: number
  temperature: number
  rainfall: number
  humidity: number
  moisture: number
  createdAt: string
}


