const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

exports.exportExcel = (data, fileName) => {
  const workbook = XLSX.utils.book_new();

  const worksheet = XLSX.utils.json_to_sheet(data);

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};