// Acceptance tests: extract the text layer with pdfjs (pdftotext is unavailable),
// then assert required strings present / forbidden strings absent, and page count <= 2.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, 'out')

async function extract(file) {
  const data = new Uint8Array(readFileSync(join(outDir, file)))
  const doc = await getDocument({ data, useSystemFonts: true }).promise
  let text = ''
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    text += content.items.map((i) => i.str).join(' ') + '\n'
  }
  return { text, pages: doc.numPages }
}

const REQUIRED_PL = [
  'workflow', 'konfiguracja', 'firma', 'weryfikacja',
  'MCP', 'agentic workflows', 'multi-agent',
]
const REQUIRED_KEYWORDS = [
  'agentic workflows', 'multi-agent systems', 'MCP (Model Context Protocol)',
  'Claude Code', 'LLM orchestration', 'AI-SDLC', 'RAG', 'GitHub Copilot',
]
const FORBIDDEN = ['workfow', 'frma', 'konfguracja', 'B1', 'deadline', 'Tracy', 'Metabase', '15.06']

function check(label, text, required, forbidden) {
  const norm = text.replace(/\s+/g, ' ')
  let ok = true
  console.log(`\n=== ${label} ===`)
  console.log('-- REQUIRED present --')
  for (const s of required) {
    const found = norm.includes(s)
    if (!found) ok = false
    console.log(`  ${found ? 'OK  ' : 'FAIL'}  "${s}"`)
  }
  console.log('-- FORBIDDEN absent --')
  for (const s of forbidden) {
    const found = norm.includes(s)
    if (found) ok = false
    console.log(`  ${found ? 'FAIL' : 'OK  '}  "${s}"`)
  }
  return ok
}

let allOk = true
const pl = await extract('Mateusz_Markowski_CV_PL.pdf')
const en = await extract('Mateusz_Markowski_CV_EN.pdf')

allOk &= check('PL — Polish fi/fl words + keywords', pl.text, [...REQUIRED_PL, ...REQUIRED_KEYWORDS], FORBIDDEN)
allOk &= check('EN — keywords', en.text, REQUIRED_KEYWORDS, FORBIDDEN)

console.log('\n=== PAGE COUNT (max 2) ===')
console.log(`  PL: ${pl.pages} page(s)  ${pl.pages <= 2 ? 'OK' : 'FAIL'}`)
console.log(`  EN: ${en.pages} page(s)  ${en.pages <= 2 ? 'OK' : 'FAIL'}`)
if (pl.pages > 2 || en.pages > 2) allOk = false

console.log('\n=== TEXT SELECTABLE (non-empty text layer) ===')
console.log(`  PL: ${pl.text.trim().length} chars  ${pl.text.trim().length > 500 ? 'OK' : 'FAIL'}`)
console.log(`  EN: ${en.text.trim().length} chars  ${en.text.trim().length > 500 ? 'OK' : 'FAIL'}`)

console.log(`\n=== RESULT: ${allOk ? 'ALL PASS' : 'FAILURES ABOVE'} ===`)
process.exit(allOk ? 0 : 1)
