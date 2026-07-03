/**
 * Capture Kaggle gallery screenshots from the live TraceFork dashboard.
 * Usage: node scripts/capture_screenshots.mjs
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots')
const BASE = 'https://tracefork-3f5ac.web.app'
const VIEWPORT = { width: 1440, height: 900 }

async function waitForLoaded(page) {
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(1200)
  await page.locator('text=Loading').first().waitFor({ state: 'hidden', timeout: 25000 }).catch(() => {})
  await page.waitForTimeout(800)
}

async function selectLot(page, lot) {
  const select = page.locator('select[aria-label="Select batch lot"]')
  if (await select.count()) {
    await select.selectOption(lot)
    await waitForLoaded(page)
  }
}

async function shot(page, name) {
  const file = path.join(OUT_DIR, name)
  await page.screenshot({ path: file, fullPage: false, type: 'png' })
  console.log(`Saved ${name}`)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  })
  const page = await context.newPage()

  // 1. Command Center
  await page.goto(`${BASE}/`)
  await waitForLoaded(page)
  await shot(page, '01-command-center.png')

  // 2. Trace Explorer — happy lot
  await page.goto(`${BASE}/explorer`)
  await waitForLoaded(page)
  await selectLot(page, 'LOT-2026-0421')
  await page.waitForSelector('text=Supply Chain Graph', { timeout: 20000 })
  await shot(page, '02-trace-explorer.png')

  // 3. Recall Simulator — CRITICAL recall
  await page.goto(`${BASE}/simulator`)
  await waitForLoaded(page)
  await selectLot(page, 'LOT-2026-0421')
  await page.waitForSelector('text=Impact Preview', { timeout: 20000 })
  await page.waitForSelector('text=CRITICAL SEVERITY', { timeout: 20000 }).catch(() => {})
  await shot(page, '03-recall-simulator-critical.png')

  // 4. Recall blocked — incomplete trace
  await selectLot(page, 'LOT-2026-0199')
  await page.waitForSelector('text=Trace incomplete', { timeout: 20000 })
  await shot(page, '04-recall-blocked-incomplete.png')

  // 5. Cold Chain Monitor — violation lot
  await page.goto(`${BASE}/monitor`)
  await waitForLoaded(page)
  await selectLot(page, 'LOT-2026-0315')
  await page.waitForSelector('text=Cold Chain Analytics', { timeout: 20000 })
  await shot(page, '05-cold-chain-monitor.png')

  // 6. Demo Scenarios — overview
  await page.goto(`${BASE}/demo`)
  await waitForLoaded(page)
  await shot(page, '06-demo-scenarios.png')

  // 7. Demo Scenarios — run all
  const runBtn = page.getByRole('button', { name: /Run all scenarios/i })
  if (await runBtn.count()) {
    await runBtn.click()
    await page.waitForSelector('text=scenarios passed', { timeout: 30000 }).catch(() => {})
    await page.waitForTimeout(1000)
    await shot(page, '07-demo-scenarios-results.png')
  }

  // 8. AI Agent — landing
  await page.goto(`${BASE}/agent`)
  await waitForLoaded(page)
  await shot(page, '08-ai-agent.png')

  // 9. AI Agent — after chat
  const suggestion = page.getByRole('button', {
    name: 'Trace LOT-2026-0421 and summarize compliance',
  })
  if (await suggestion.count()) {
    await suggestion.click()
    await page.waitForSelector('text=TraceFork Agent', { timeout: 45000 })
    await page.waitForTimeout(1500)
    await shot(page, '09-ai-agent-chat.png')
  }

  await browser.close()
  console.log(`\nDone. Screenshots in ${OUT_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
