import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }
  //  exportToExcel(data: any[], fileName: string, excludeFields: string[] = []) {
  //   if (!data || data.length === 0) return;

  //   // Remove excluded fields
  //   const filteredData = data.map(item => {
  //     const newItem: any = { ...item };
  //     excludeFields.forEach(field => delete newItem[field]);
  //     return newItem;
  //   });

  //   const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

  //   // Style header
  //   const headerKeys = Object.keys(filteredData[0]);
  //   headerKeys.forEach((key, index) => {
  //     const cellRef = XLSX.utils.encode_cell({ c: index, r: 0 });
  //     if (!worksheet[cellRef]) return;
  //     worksheet[cellRef].s = {
  //       fill: {
  //         patternType: 'solid',
  //         fgColor: { rgb: 'D9E1F2' } // light blue
  //       },
  //       font: {
  //         bold: true
  //       },
  //       alignment: {
  //         horizontal: 'center'
  //       }
  //     };
  //   });

  //   const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  //   const now = new Date();
  //   const formattedDate = `${now.getDate().toString().padStart(2, '0')}_${(now.getMonth() + 1)
  //     .toString()
  //     .padStart(2, '0')}_${now.getFullYear()}`;
  //   const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //   const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });


  //   FileSaver.saveAs(blob, `${fileName}_${formattedDate}.xlsx`);
  // }
  exportToExcel(data: any[], fileName: string, excludeFields: string[] = []) {
  if (!data || data.length === 0) return;

  const filteredData = data.map(item => {
    const newItem: any = { ...item };
    excludeFields.forEach(field => delete newItem[field]);
    return newItem;
  });

  // Create an empty sheet first
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);

  // ✅ 1. Add the title to cell A1
  XLSX.utils.sheet_add_aoa(worksheet, [[fileName + ' List']], { origin: 'A1' });

  // ✅ 2. Merge title across all header columns
  const colCount = Object.keys(filteredData[0]).length;
  worksheet['!merges'] = [{
    s: { r: 0, c: 0 }, // start row, col
    e: { r: 0, c: colCount - 1 }  // end row, col
  }];

  // ✅ 3. Style title cell
  worksheet['A1'].s = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: 'center' }
  };

  // ✅ 4. Add data starting from A3 (after title + blank row)
  XLSX.utils.sheet_add_json(worksheet, filteredData, {
    origin: 'A3',
    skipHeader: false
  });

  // ✅ 5. Style the header row (which is now at row 3 → index 2)
  const headerKeys = Object.keys(filteredData[0]);
  headerKeys.forEach((_, index) => {
    const cellRef = XLSX.utils.encode_cell({ c: index, r: 2 });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        fill: { patternType: 'solid', fgColor: { rgb: 'D9E1F2' } },
        font: { bold: true },
        alignment: { horizontal: 'center' }
      };
    }
  });

  // ✅ 6. Export
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, '0')}_${(now.getMonth() + 1)
    .toString().padStart(2, '0')}_${now.getFullYear()}`;
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  FileSaver.saveAs(blob, `${fileName}_${formattedDate}.xlsx`);
}
  exportToPDF(data: any[], fileName: string, excludeFields: string[] = []) {
  if (!data || data.length === 0) return;

  const filteredData = data.map(item => {
    const newItem: any = { ...item };
    excludeFields.forEach(field => delete newItem[field]);
    return newItem;
  });

  const doc = new jsPDF();

  const headers = [Object.keys(filteredData[0])];
  const rows = filteredData.map(obj => headers[0].map(key => obj[key]));

  // Format date
  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, '0')}_${
    (now.getMonth() + 1).toString().padStart(2, '0')}_${now.getFullYear()}`;

  // Title
  doc.setFontSize(14);
  doc.text(`${fileName} - ${formattedDate}`, 14, 15);

  autoTable(doc, {
    startY: 20,
    head: headers,
    body: rows,
    styles: {
      halign: 'left',
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [41, 128, 185], // blue
      textColor: 255,
      fontStyle: 'bold'
    }
  });

  doc.save(`${fileName}_${formattedDate}.pdf`);
}
}
