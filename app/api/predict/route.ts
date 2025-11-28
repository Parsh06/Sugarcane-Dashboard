import { NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import { existsSync } from "fs"

const PYTHON_BIN = process.env.PYTHON_BIN || "python"

function executePythonScript(payload: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "model", "predict.py")
    
    // Check if script exists
    if (!existsSync(scriptPath)) {
      reject(new Error(`Python script not found at ${scriptPath}`))
      return
    }
    
    const child = spawn(PYTHON_BIN, [scriptPath], { 
      cwd: process.cwd(),
      env: { ...process.env, PYTHONUNBUFFERED: "1" }
    })

    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (data) => {
      stdout += data.toString()
    })

    child.stderr.on("data", (data) => {
      stderr += data.toString()
    })

    child.on("error", (error) => {
      console.error("Python spawn error:", error)
      reject(new Error(`Failed to start Python process: ${error.message}`))
    })

    child.on("close", (code) => {
      // Try to parse stdout as JSON even if code is non-zero
      // Python script writes errors as JSON to stdout
      if (stdout.trim()) {
        try {
          const parsed = JSON.parse(stdout.trim())
          if (parsed.error) {
            reject(new Error(parsed.error))
            return
          }
          if (code === 0) {
            resolve(stdout)
            return
          }
        } catch {
          // Not JSON, continue with normal error handling
        }
      }
      
      if (code === 0) {
        resolve(stdout)
      } else {
        const errorMsg = stderr || stdout || `Python process exited with code ${code}`
        console.error("Python error output:", { code, stderr, stdout })
        reject(new Error(errorMsg))
      }
    })

    child.stdin.write(payload)
    child.stdin.end()
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Received prediction request:", JSON.stringify(body, null, 2))
    
    const pythonResponse = await executePythonScript(JSON.stringify(body))
    const parsed = JSON.parse(pythonResponse.trim())

    if (parsed.error) {
      console.error("Python returned error:", parsed.error)
      return NextResponse.json({ error: parsed.error }, { status: 500 })
    }

    console.log("Prediction successful")
    return NextResponse.json(parsed)
  } catch (error) {
    console.error("Prediction error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate prediction."
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? String(error) : undefined
    }, { status: 500 })
  }
}


