import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportElementToPDF(elementId: string, fileName: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`)
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pdfWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 10

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight - 20

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight - 20
    }

    pdf.save(fileName)
  } catch (error) {
    console.error('Failed to export PDF:', error)
    throw error
  }
}

export async function exportMultipleSectionsToPDF(
  sections: Array<{ id: string; title: string }>,
  fileName: string
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  let isFirstPage = true

  for (const section of sections) {
    const element = document.getElementById(section.id)
    if (!element) continue

    if (!isFirstPage) {
      pdf.addPage()
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = pdfWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let position = 10
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)

      let heightLeft = imgHeight
      heightLeft -= pdfHeight - 20

      while (heightLeft >= 0) {
        pdf.addPage()
        position = heightLeft - imgHeight
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight - 20
      }

      isFirstPage = false
    } catch (error) {
      console.error(`Failed to export section ${section.id}:`, error)
    }
  }

  pdf.save(fileName)
}
