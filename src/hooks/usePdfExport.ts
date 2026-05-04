import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useCvStore } from '../store/cvStore'

export function usePdfExport() {
  const { isEditMode, toggleEditMode, cv } = useCvStore()

  const exportPdf = async () => {
    const wasEditing = isEditMode
    if (wasEditing) toggleEditMode()

    await new Promise((r) => setTimeout(r, 300))

    const element = document.getElementById('cv-document')
    if (!element) return

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#F5F4F0',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    const pageHeight = pdf.internal.pageSize.getHeight()
    let position = 0

    if (pdfHeight <= pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    } else {
      let remainingHeight = pdfHeight
      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
        remainingHeight -= pageHeight
        position -= pageHeight
        if (remainingHeight > 0) pdf.addPage()
      }
    }

    const fileName = cv.personal.name.replace(/\s+/g, '_') || 'CV'
    pdf.save(`${fileName}_CV.pdf`)

    if (wasEditing) toggleEditMode()
  }

  return { exportPdf }
}
