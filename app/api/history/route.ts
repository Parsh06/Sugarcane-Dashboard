import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { PredictionRecord } from "@/types/prediction"

const HISTORY_FILE = path.join(process.cwd(), "data", "predictions.json")

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

async function readHistory(): Promise<PredictionRecord[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(HISTORY_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeHistory(history: PredictionRecord[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), "utf-8")
}

export async function GET() {
  try {
    const history = await readHistory()
    return NextResponse.json(history.slice(0, 50))
  } catch (error) {
    console.error("Error reading history:", error)
    return NextResponse.json({ error: "Failed to read history" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const record: PredictionRecord = await request.json()
    const history = await readHistory()
    const updated = [record, ...history].slice(0, 50)
    await writeHistory(updated)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving history:", error)
    return NextResponse.json({ error: "Failed to save history" }, { status: 500 })
  }
}

