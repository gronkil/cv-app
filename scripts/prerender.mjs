// Post-build prerender: inject the statically rendered CV into dist/index.html.
// Runs after `vite build` (client) and `vite build --ssr src/entry-server.tsx`.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const serverEntry = pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href
const indexPath = resolve(root, 'dist/index.html')

const { render } = await import(serverEntry)
const { html, styles } = render()

let template = readFileSync(indexPath, 'utf-8')

if (!template.includes('<div id="root"></div>')) {
  throw new Error('prerender: could not find <div id="root"></div> in dist/index.html')
}

template = template
  .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
  .replace('</head>', `${styles}</head>`)

writeFileSync(indexPath, template)

// The SSR bundle is a build artifact only; drop it from the deploy output.
rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true })

console.log('prerender: injected static CV into dist/index.html')
