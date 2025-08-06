'use strict';

import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';
import { Response } from 'express';

export class ExportService {
  /**
   * Export data to CSV format
   */
  exportToCSV(data: any[], filename: string, res: Response) {
    if (!data.length) {
      res.status(400).json({ error: 'No data to export' });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',');
    });
    
    const csv = [csvHeaders, ...csvRows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.send(csv);
  }

  /**
   * Export data to Excel format
   */
  exportToExcel(data: any[], filename: string, res: Response) {
    if (!data.length) {
      res.status(400).json({ error: 'No data to export' });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    res.send(buffer);
  }

  /**
   * Export data to PDF format
   */
  exportToPDF(data: any, title: string, filename: string, res: Response) {
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    
    doc.pipe(res);
    
    // Add title
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();
    
    // Add summary section
    if (data.summary) {
      doc.fontSize(14).text('Summary', { underline: true });
      doc.fontSize(10);
      
      Object.entries(data.summary).forEach(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
        doc.text(`${formattedKey}: ${value}`);
      });
      
      doc.moveDown();
    }
    
    // Add data tables
    if (data.tableData && Array.isArray(data.tableData)) {
      this.addTableToPDF(doc, data.tableData);
    }
    
    doc.end();
  }

  /**
   * Add table to PDF document
   */
  private addTableToPDF(doc: any, data: any[]) {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const startX = 50;
    let currentY = doc.y;
    
    // Draw headers
    doc.fontSize(8);
    headers.forEach((header, i) => {
      doc.text(header, startX + (i * 100), currentY, { width: 95 });
    });
    
    currentY += 20;
    
    // Draw data rows
    data.forEach(row => {
      headers.forEach((header, i) => {
        const value = row[header] || '';
        doc.text(String(value), startX + (i * 100), currentY, { width: 95 });
      });
      currentY += 15;
      
      // Check for page break
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    });
  }

  /**
   * Export data to JSON format
   */
  exportToJSON(data: any, filename: string, res: Response) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    res.json(data);
  }
}

export const exportService = new ExportService();