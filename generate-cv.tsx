import React from 'react'
// @react-pdf/reconciler requires React in global scope
;(globalThis as any).React = React

import { renderToFile } from '@react-pdf/renderer'
import { CvPdfDocument } from './src/components/pdf/CvPdfDocument'
import { cvData } from './src/data/defaultCv'

async function main() {
  const output = process.argv[2] || '/tmp/Mateusz_Markowski_CV.pdf'
  console.log(`Generating PDF → ${output}`)
  await renderToFile(React.createElement(CvPdfDocument, { data: cvData, lang: 'pl' }), output)
  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
