import { GoogleGenerativeAI, SchemaType, type FunctionDeclaration } from '@google/generative-ai'
import {
  firestoreListBatches,
  firestoreRecall,
  firestoreTrace,
} from './firestoreService'

const SYSTEM_PROMPT = `You are TraceFork Orchestrator — an AI agent for food supply chain traceability.
Use tools for all batch data. Never invent data.
If trace is incomplete, refuse recall and explain why.
For CRITICAL recalls, mention human approval is required.
Be concise and professional. Demo lots: LOT-2026-0421 (happy), LOT-2026-0315 (cold chain), LOT-2026-0199 (incomplete).`

const TOOLS: FunctionDeclaration[] = [
  {
    name: 'trace_batch',
    description: 'Trace a food batch by lot number.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { lot_number: { type: SchemaType.STRING } },
      required: ['lot_number'],
    },
  },
  {
    name: 'simulate_recall',
    description: 'Simulate product recall from contamination node.',
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
    description: 'Verify tamper-evident hash chain.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { lot_number: { type: SchemaType.STRING } },
      required: ['lot_number'],
    },
  },
  {
    name: 'list_batches',
    description: 'List all batches.',
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
]

async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  if (name === 'trace_batch') {
    return JSON.stringify(await firestoreTrace(args.lot_number))
  }
  if (name === 'simulate_recall') {
    return JSON.stringify(
      await firestoreRecall(
        args.lot_number,
        args.contamination_node_id,
        args.reason || 'contamination',
      ),
    )
  }
  if (name === 'verify_integrity') {
    const t = await firestoreTrace(args.lot_number)
    return JSON.stringify({ lot_number: args.lot_number, integrity: t.integrity })
  }
  if (name === 'list_batches') {
    const { batches } = await firestoreListBatches()
    return JSON.stringify({ batches: batches.map((b) => b.lot_number) })
  }
  return JSON.stringify({ error: `Unknown tool: ${name}` })
}

export async function runClientAgent(message: string, lotNumber?: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations: TOOLS }],
  })

  const userMsg = lotNumber ? `[Context lot: ${lotNumber}] ${message}` : message
  const chat = model.startChat()
  let response = await chat.sendMessage(userMsg)

  for (let round = 0; round < 5; round++) {
    const calls = response.response.functionCalls()
    if (!calls?.length) break

    const results = await Promise.all(
      calls.map(async (call) => ({
        name: call.name,
        response: {
          result: await executeTool(call.name, call.args as Record<string, string>),
        },
      })),
    )

    response = await chat.sendMessage(
      results.map((r) => ({
        functionResponse: { name: r.name, response: r.response },
      })),
    )
  }

  return response.response.text() || 'Done.'
}
