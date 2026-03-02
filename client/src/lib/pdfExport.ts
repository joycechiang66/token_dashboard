/**
 * PDF Export Utilities
 * 
 * Provides functions to export cost analysis data and charts to PDF format
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export cost analysis page to PDF
 * Captures all charts and data tables
 */
export async function exportCostAnalysisToPDF(fileName: string = 'cost-analysis.pdf') {
  try {
    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let currentY = margin;

    // Add title
    pdf.setFontSize(20);
    pdf.text('成本分析報告', margin, currentY);
    currentY += 15;

    // Add generation date
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    const now = new Date();
    pdf.text(`生成時間: ${now.toLocaleString('zh-TW')}`, margin, currentY);
    currentY += 10;

    // Reset text color
    pdf.setTextColor(0, 0, 0);

    // Helper function to add section
    const addSection = (title: string, yPosition: number) => {
      pdf.setFontSize(14);
      pdf.setFont('Helvetica', 'bold');
      pdf.text(title, margin, yPosition);
      pdf.setFont('Helvetica', 'normal');
      return yPosition + 10;
    };

    // Helper function to add table
    const addTable = (
      headers: string[],
      rows: (string | number)[][],
      yPosition: number,
      columnWidths?: number[]
    ) => {
      const cellHeight = 7;
      const headerHeight = 10;
      let currentYPos = yPosition;

      // Calculate column widths if not provided
      const colWidths = columnWidths || Array(headers.length).fill(contentWidth / headers.length);

      // Draw header
      pdf.setFont('Helvetica', 'bold');
      pdf.setFillColor(59, 130, 246); // Primary blue
      pdf.setTextColor(255, 255, 255);

      let xPos = margin;
      headers.forEach((header, index) => {
        pdf.rect(xPos, currentYPos, colWidths[index], headerHeight, 'F');
        pdf.text(header, xPos + 2, currentYPos + 6, { maxWidth: colWidths[index] - 4 });
        xPos += colWidths[index];
      });

      currentYPos += headerHeight;

      // Draw rows
      pdf.setFont('Helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      rows.forEach((row, rowIndex) => {
        // Check if we need a new page
        if (currentYPos + cellHeight > pageHeight - margin) {
          pdf.addPage();
          currentYPos = margin;
        }

        xPos = margin;
        row.forEach((cell, colIndex) => {
          const bgColor = rowIndex % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
          pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          pdf.rect(xPos, currentYPos, colWidths[colIndex], cellHeight, 'F');
          pdf.rect(xPos, currentYPos, colWidths[colIndex], cellHeight); // Border

          const cellText = String(cell);
          pdf.text(cellText, xPos + 2, currentYPos + 4, { maxWidth: colWidths[colIndex] - 4 });
          xPos += colWidths[colIndex];
        });

        currentYPos += cellHeight;
      });

      return currentYPos + 5;
    };

    // Capture and add charts
    const captureElement = async (elementId: string, title: string, yPos: number) => {
      const element = document.getElementById(elementId);
      if (!element) return yPos;

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if we need a new page
        if (yPos + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }

        // Add title
        pdf.setFontSize(12);
        pdf.setFont('Helvetica', 'bold');
        pdf.text(title, margin, yPos);
        yPos += 8;

        // Add image
        pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;

        return yPos;
      } catch (error) {
        console.error(`Failed to capture ${elementId}:`, error);
        return yPos;
      }
    };

    // Add budget status section
    currentY = addSection('預算狀態', currentY);
    const budgetElement = document.getElementById('budget-status');
    if (budgetElement) {
      try {
        const canvas = await html2canvas(budgetElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (currentY + imgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
      } catch (error) {
        console.error('Failed to capture budget status:', error);
      }
    }

    // Add summary stats section
    currentY = addSection('成本統計', currentY);
    const statsElement = document.getElementById('summary-stats');
    if (statsElement) {
      try {
        const canvas = await html2canvas(statsElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (currentY + imgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
      } catch (error) {
        console.error('Failed to capture summary stats:', error);
      }
    }

    // Add cost trend chart
    currentY = addSection('成本趨勢', currentY);
    currentY = await captureElement('cost-trend-chart', '過去 30 天成本趨勢', currentY);

    // Add budget history chart
    currentY = addSection('預算歷史', currentY);
    currentY = await captureElement('budget-history-chart', '預算使用歷史趨勢', currentY);

    // Add model cost analysis chart
    currentY = addSection('模型分析', currentY);
    currentY = await captureElement('model-cost-analysis', '公司模型成本分析', currentY);

    // Add department comparison chart
    currentY = addSection('部門對比', currentY);
    currentY = await captureElement('department-comparison', '部門成本對比', currentY);

    // Save PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
}

/**
 * Export cost data as table to PDF
 */
export function exportCostDataTableToPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  fileName: string = 'cost-data.pdf'
) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let currentY = margin;

  // Add title
  pdf.setFontSize(16);
        pdf.setFont('Helvetica', 'bold');
  pdf.text(title, margin, currentY);
  currentY += 12;

  // Add generation date
  pdf.setFontSize(10);
        pdf.setFont('Helvetica', 'normal');
  pdf.setTextColor(128, 128, 128);
  const now = new Date();
  pdf.text(`生成時間: ${now.toLocaleString('zh-TW')}`, margin, currentY);
  currentY += 10;

  // Reset text color
  pdf.setTextColor(0, 0, 0);

  // Add table
  const columnWidths = Array(headers.length).fill(contentWidth / headers.length);
  addTableToPDF(pdf, headers, rows, margin, currentY, columnWidths);

  pdf.save(fileName);
}

/**
 * Helper function to add table to PDF
 */
function addTableToPDF(
  pdf: jsPDF,
  headers: string[],
  rows: (string | number)[][],
  margin: number,
  startY: number,
  columnWidths: number[]
) {
  const pageHeight = pdf.internal.pageSize.getHeight();
  const cellHeight = 7;
  const headerHeight = 10;
  let currentY = startY;

  // Draw header
  pdf.setFont('Helvetica', 'bold');
  pdf.setFillColor(59, 130, 246);
  pdf.setTextColor(255, 255, 255);

  let xPos = margin;
  headers.forEach((header, index) => {
    pdf.rect(xPos, currentY, columnWidths[index], headerHeight, 'F');
    pdf.text(header, xPos + 2, currentY + 6, { maxWidth: columnWidths[index] - 4 });
    xPos += columnWidths[index];
  });

  currentY += headerHeight;

  // Draw rows
  pdf.setFont('Helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  rows.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (currentY + cellHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }

    xPos = margin;
    row.forEach((cell, colIndex) => {
      const bgColor = rowIndex % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(xPos, currentY, columnWidths[colIndex], cellHeight, 'F');
      pdf.rect(xPos, currentY, columnWidths[colIndex], cellHeight);

      const cellText = String(cell);
      pdf.text(cellText, xPos + 2, currentY + 4, { maxWidth: columnWidths[colIndex] - 4 });
      xPos += columnWidths[colIndex];
    });

    currentY += cellHeight;
  });
}
