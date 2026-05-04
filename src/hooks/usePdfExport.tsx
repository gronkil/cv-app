import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { CvPdfDocument } from '../components/pdf/CvPdfDocument'
import { cvData } from '../data/defaultCv'

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportPdf = async () => {
    setIsExporting(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(<CvPdfDocument data={cvData} /> as any).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cvData.personal.name.replace(/\s+/g, '_')}_CV.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[PDF export error]', err)
      alert(`Błąd eksportu PDF: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsExporting(false)
    }
  }

  return { exportPdf, isExporting }
}
