// Renders cv/data.mjs -> clean, selectable A4 PDF via Chromium (Playwright).
// Toolchain is deliberately different from the app's @react-pdf/renderer, which
// corrupted the fi/fl ligatures in the text layer. Ligatures are also disabled in CSS.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { chromium } from 'playwright'
import { documents } from './data.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, 'out')
mkdirSync(outDir, { recursive: true })

const fontDir = join(__dirname, '..', 'node_modules', '@fontsource', 'inter', 'files')
const b64 = (f) => readFileSync(join(fontDir, f)).toString('base64')
const face = (weight, subset, range) => `
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: ${weight};
  font-display: block;
  src: url(data:font/woff2;base64,${b64(`inter-${subset}-${weight}-normal.woff2`)}) format('woff2');
  unicode-range: ${range};
}`

const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
const LATIN_EXT = 'U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'
const fontFaces = [400, 600, 700].map((w) => face(w, 'latin', LATIN) + face(w, 'latin-ext', LATIN_EXT)).join('\n')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function skillsHtml(skills) {
  return skills
    .map(
      (g) => `<div class="skill-row">
        <div class="skill-group">${esc(g.group)}</div>
        <div class="skill-items">${g.items.map(esc).join(' · ')}</div>
      </div>`
    )
    .join('')
}

function projectsHtml(projects, techLabel) {
  return projects
    .map(
      (p) => `<div class="entry">
        <div class="entry-head"><span class="entry-title">${esc(p.name)}</span></div>
        <div class="entry-tech">${esc(techLabel)}: ${esc(p.tech)}</div>
        <ul>${p.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      </div>`
    )
    .join('')
}

function experienceHtml(experience) {
  return experience
    .map(
      (e) => `<div class="entry">
        <div class="entry-head">
          <span class="entry-title">${esc(e.role)} · ${esc(e.company)}</span>
          <span class="entry-period">${esc(e.period)}</span>
        </div>
        <ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      </div>`
    )
    .join('')
}

function render(d) {
  const c = d.contact
  const contactLine = [
    `<a href="mailto:${c.email}">${c.email}</a>`,
    esc(c.location),
    `<a href="${c.linkedinUrl}">${esc(c.linkedinText)}</a>`,
    `<a href="${c.githubUrl}">${esc(c.githubText)}</a>`,
  ].join('<span class="sep">·</span>')

  const eduHtml = d.education
    .map((e) => `<div class="edu">${esc(e.degree)} — ${esc(e.school)}, ${esc(e.location)}</div>`)
    .join('')

  const langHtml = d.languages.map((l) => `${esc(l.language)} — ${esc(l.level)}`).join('<span class="sep">·</span>')

  return `<!doctype html><html lang="${d.lang}"><head><meta charset="utf-8"><style>
${fontFaces}
* { margin: 0; padding: 0; box-sizing: border-box; }
:root { --navy:#1C2333; --gold:#B08A2E; --muted:#4a5163; --line:#d9d7d0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body {
  font-family: 'Inter', 'Liberation Sans', Arial, sans-serif;
  font-variant-ligatures: none;
  -webkit-font-feature-settings: "liga" 0, "clig" 0, "dlig" 0;
  font-feature-settings: "liga" 0, "clig" 0, "dlig" 0;
  color: var(--navy); font-size: 10.3pt; line-height: 1.4;
  padding: 13mm 14mm;
}
a { color: var(--gold); text-decoration: none; }
h1 { font-size: 21pt; font-weight: 700; letter-spacing: -0.2px; }
.title { color: var(--gold); font-weight: 600; font-size: 10.8pt; margin-top: 2px; }
.contact { color: var(--muted); font-size: 9.4pt; margin-top: 6px; }
.sep { margin: 0 6px; color: var(--line); }
section { margin-top: 13px; }
h2 {
  font-size: 9.2pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.4px;
  color: var(--navy); padding-bottom: 3px; border-bottom: 1.4px solid var(--gold); margin-bottom: 7px;
}
.profile { font-size: 10.1pt; line-height: 1.45; text-align: justify; }
.skill-row { display: flex; gap: 10px; margin-bottom: 3.5px; }
.skill-group { flex: 0 0 27%; font-weight: 600; color: var(--navy); }
.skill-items { flex: 1; color: var(--muted); }
.entry { margin-bottom: 9px; }
.entry:last-child { margin-bottom: 0; }
.entry-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.entry-title { font-weight: 600; font-size: 10.6pt; }
.entry-period { color: var(--muted); font-size: 9.3pt; white-space: nowrap; }
.entry-tech { color: var(--gold); font-size: 9.3pt; margin: 1px 0 3px; }
ul { list-style: none; margin-top: 2px; }
li { position: relative; padding-left: 12px; margin-bottom: 2.5px; }
li::before { content: "–"; position: absolute; left: 0; color: var(--gold); }
.edu { margin-bottom: 2px; }
.interests { color: var(--muted); font-size: 9.6pt; margin-top: 10px; }
.entry, .skill-row, li { break-inside: avoid; }
section { break-inside: avoid-column; }
</style></head><body>
  <header>
    <h1>${esc(d.name)}</h1>
    <div class="title">${esc(d.title)}</div>
    <div class="contact">${contactLine}</div>
  </header>

  <section><h2>${esc(d.labels.profile)}</h2><p class="profile">${esc(d.profile)}</p></section>

  <section><h2>${esc(d.labels.skills)}</h2>${skillsHtml(d.skills)}</section>

  <section><h2>${esc(d.labels.aiProjects)}</h2>${projectsHtml(d.aiProjects, d.labels.tech)}</section>

  <section><h2>${esc(d.labels.experience)}</h2>${experienceHtml(d.experience)}</section>

  <section><h2>${esc(d.labels.languages)}</h2><div>${langHtml}</div>
    <div class="interests">${esc(d.interestsLine)}</div></section>

  <section><h2>${esc(d.labels.education)}</h2>${eduHtml}</section>
</body></html>`
}

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
})
const page = await browser.newPage()
for (const [key, d] of Object.entries(documents)) {
  const html = render(d)
  const htmlPath = join(outDir, `cv-${key}.html`)
  const pdfPath = join(outDir, `Mateusz_Markowski_CV_${key.toUpperCase()}.pdf`)
  writeFileSync(htmlPath, html)
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.emulateMedia({ media: 'print' })
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  })
  console.log('wrote', pdfPath)
}
await browser.close()
