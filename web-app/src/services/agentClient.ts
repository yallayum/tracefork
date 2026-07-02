import { getFunctions, httpsCallable } from 'firebase/functions'
import { FirebaseError } from 'firebase/app'
import { app } from '../firebase/config'
import { runClientAgent } from './agentService'
import { runFallbackAgent } from './fallbackAgent'

const API = '/api'
const FUNCTIONS_REGION = 'us-central1'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, init)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

function callableErrorMessage(error: unknown): string | null {
  if (error instanceof FirebaseError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return null
}

export async function agentChat(message: string, lot?: string): Promise<string> {
  // 1. Local FastAPI (dev)
  if (!import.meta.env.PROD) {
    const data = await apiFetch<{ reply: string }>('/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, lot_number: lot }),
    })
    if (data?.reply) return data.reply
  }

  // 2. Firebase Cloud Function (production)
  try {
    const functions = getFunctions(app, FUNCTIONS_REGION)
    const callable = httpsCallable<{ message: string; lot_number?: string }, { reply: string }>(
      functions,
      'agentChat',
    )
    const result = await callable({ message, lot_number: lot })
    if (result.data?.reply) return result.data.reply
  } catch (e) {
    console.warn('Cloud Function agent:', callableErrorMessage(e))
  }

  // 3. Client-side Gemini + Firestore tools
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    try {
      return await runClientAgent(message, lot)
    } catch (e) {
      console.warn('Client Gemini agent:', e)
    }
  }

  // 4. Direct Firestore tools (always works — no API key needed)
  try {
    return await runFallbackAgent(message, lot)
  } catch (e) {
    return `Agent error: ${e instanceof Error ? e.message : String(e)}`
  }
}
