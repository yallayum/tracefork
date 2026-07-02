import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { runAgent } from './agent.js'

const geminiApiKey = defineSecret('GEMINI_API_KEY')

export const agentChat = onCall(
  {
    secrets: [geminiApiKey],
    cors: true,
    region: 'us-central1',
    maxInstances: 10,
  },
  async (request) => {
    const message = request.data?.message as string | undefined
    const lotNumber = request.data?.lot_number as string | undefined

    if (!message?.trim()) {
      throw new HttpsError('invalid-argument', 'message is required')
    }

    try {
      const reply = await runAgent(message, lotNumber, geminiApiKey.value())
      return { reply }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Agent failed'
      throw new HttpsError('internal', msg)
    }
  },
)
