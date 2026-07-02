import { GoogleGenerativeAI, SchemaType, type FunctionDeclaration } from '@google/generative-ai'
import { executeTool } from './tools.js'
import { runFallbackAgent } from './fallback.js'

const SYSTEM_PROMPT = `You are TraceFork Orchestrator for food supply chain traceability.
Use tools only — never invent batch data. Be concise and professional.
Demo lots: LOT-2026-0421, LOT-2026-0315, LOT-2026-0199.`

const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'trace_batch',
    description: 'Trace batch by lot number',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { lot_number: { type: SchemaType.STRING } },
      required: ['lot_number'],
    },
  },
  {
    name: 'simulate_recall',
    description: 'Simulate recall from contamination node',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        lot_number: { type: SchemaType.STRING },
        contamination_node_id: { type: SchemaType.STRING },
        reason: { type: SchemaType.STRING },
      },
      required: ['lot_number', 'contamination_node_id', 'reason'],
    },
  },
  {
    name: 'verify_integrity',
    description: 'Verify hash chain integrity',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { lot_number: { type: SchemaType.STRING } },
      required: ['lot_number'],
    },
  },
  {
    name: 'list_batches',
    description: 'List all batches',
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
]

export async function runAgent(message: string, lotNumber?: string, apiKey?: string): Promise<string> {
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
    })

    const userMsg = lotNumber ? `[Context lot: ${lotNumber}] ${message}` : message
    const chat = model.startChat()
    let response = await chat.sendMessage(userMsg)

    for (let i = 0; i < 5; i++) {
      const calls = response.response.functionCalls()
      if (!calls?.length) break

      const results = await Promise.all(
        calls.map(async (call) => ({
          name: call.name,
          response: { result: await executeTool(call.name, call.args as Record<string, string>) },
        })),
      )

      response = await chat.sendMessage(
        results.map((r) => ({ functionResponse: { name: r.name, response: r.response } })),
      )
    }

    return response.response.text() || 'Done.'
  } catch {
    return runFallbackAgent(message, lotNumber)
  }
}
