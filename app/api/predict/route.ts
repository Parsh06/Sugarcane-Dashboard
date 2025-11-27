import { NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

const PYTHON_BIN = process.env.PYTHON_BIN || "python"

function executePythonScript(payload: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "model", "predict.py")
    const child = spawn(PYTHON_BIN, [scriptPath], { cwd: process.cwd() })

    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (data) => {
      stdout += data.toString()
    })

    child.stderr.on("data", (data) => {
      stderr += data.toString()
    })

    child.on("error", (error) => {
      reject(error)
    })

    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(new Error(stderr || `Python process exited with code ${code}`))
      }
    })

    child.stdin.write(payload)
    child.stdin.end()
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const pythonResponse = await executePythonScript(JSON.stringify(body))
    const parsed = JSON.parse(pythonResponse)

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 500 })
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Failed to generate prediction." }, { status: 500 })
  }
}


