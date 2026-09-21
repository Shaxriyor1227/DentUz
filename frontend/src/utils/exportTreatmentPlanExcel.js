/**
 * Exports clinical treatment plan estimation to a styled Excel (.xlsx) file
 */
export async function exportTreatmentPlanToExcel(planData = {}) {
  const ExcelJSModule = await import('exceljs');
  const ExcelJS = ExcelJSModule.default || ExcelJSModule;

  const {
    planId = 'TR-8821',
    planTitle = 'Kompleks reabilitatsiya va endodontiya',
    patient = { name: 'Anvar Qosimov', id: 'P-1042', phone: '+998 90 842 11 00', doctor: 'Dr. J. Azimov' },
    clinic = { name: 'DentUz Stomatologiya Klinikasi', phone: '+998 71 200 44 22' },
    items = [],
    totalAmount = 0,
    paidAmount = 0,
    remainingAmount = 0,
    language = 'uz'
  } = planData;

  const isEn = language === 'en';

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DentUz Dental System';
  const worksheet = workbook.addWorksheet(isEn ? 'Treatment Estimate' : 'Muolaja smetasi', {
    pageSetup: { paperSize: 9, orientation: 'portrait' }
  });

  // 1. Header Banner
  worksheet.mergeCells('A1:F1');
  const h1 = worksheet.getCell('A1');
  h1.value = `${clinic.name.toUpperCase()} — ${isEn ? 'CLINICAL TREATMENT ESTIMATE' : 'DAVOLASH REJASI SMETASI'}`;
  h1.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  h1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0891B2' } };
  h1.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 32;

  // 2. Patient & Plan Meta
  worksheet.mergeCells('A2:F2');
  const h2 = worksheet.getCell('A2');
  h2.value = `${isEn ? 'Patient' : 'Bemor'}: ${patient.name} (${patient.id}) | ${isEn ? 'Phone' : 'Tel'}: ${patient.phone} | ${isEn ? 'Doctor' : 'Shifokor'}: ${patient.doctor} | ${isEn ? 'Plan' : 'Reja'}: #${planId}`;
  h2.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF334155' } };
  h2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  h2.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).height = 22;

  // Spacing
  worksheet.getRow(3).height = 10;

  // 3. Table Headers (Row 4)
  const headers = isEn
    ? ['#', 'Category', 'Tooth #', 'Procedure Description', 'Price (UZS)', 'Status']
    : ['#', 'Yo\'nalish', 'Tish #', 'Muolaja nomi va tavsifi', 'Narxi (so\'m)', 'Holati'];

  const headerRow = worksheet.getRow(4);
  headerRow.values = headers;
  headerRow.height = 26;

  const headerBorder = {
    top: { style: 'thin', color: { argb: 'FF0891B2' } },
    left: { style: 'thin', color: { argb: 'FF0891B2' } },
    bottom: { style: 'medium', color: { argb: 'FF0891B2' } },
    right: { style: 'thin', color: { argb: 'FF0891B2' } }
  };

  headerRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0891B2' } };
    cell.alignment = {
      vertical: 'middle',
      horizontal: colNumber === 1 || colNumber === 3 || colNumber === 6 ? 'center' : colNumber === 5 ? 'right' : 'left'
    };
    cell.border = headerBorder;
  });

  const cellBorder = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
  };

  items.forEach((item, idx) => {
    const rowNum = 5 + idx;
    const row = worksheet.getRow(rowNum);
    row.height = 24;

    const isDone = item.isCompleted || item.status === 'completed';
    const statusText = isDone ? (isEn ? 'Completed' : 'Bajarilgan') : (isEn ? 'Planned' : 'Rejalashtirilgan');

    row.values = [
      idx + 1,
      item.category || '',
      item.tooth || '—',
      `${item.title || ''}${item.description ? ' (' + item.description + ')' : ''}`,
      item.price || 0,
      statusText
    ];

    const isEven = idx % 2 === 0;
    const bg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    // Col 1: #
    const c1 = row.getCell(1);
    c1.alignment = { horizontal: 'center', vertical: 'middle' };
    c1.font = { name: 'Consolas', size: 10, bold: true, color: { argb: 'FF64748B' } };
    c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    c1.border = cellBorder;

    // Col 2: Category
    const c2 = row.getCell(2);
    c2.alignment = { horizontal: 'left', vertical: 'middle' };
    c2.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0E7490' } };
    c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    c2.border = cellBorder;

    // Col 3: Tooth
    const c3 = row.getCell(3);
    c3.alignment = { horizontal: 'center', vertical: 'middle' };
    c3.font = { name: 'Consolas', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    c3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    c3.border = cellBorder;

    // Col 4: Title
    const c4 = row.getCell(4);
    c4.alignment = { horizontal: 'left', vertical: 'middle' };
    c4.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF1E293B' } };
    c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    c4.border = cellBorder;

    // Col 5: Price
    const c5 = row.getCell(5);
    c5.alignment = { horizontal: 'right', vertical: 'middle' };
    c5.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF0F172A' } };
    c5.numFmt = '#,##0;[Red]-#,##0;0';
    c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    c5.border = cellBorder;

    // Col 6: Status
    const c6 = row.getCell(6);
    c6.alignment = { horizontal: 'center', vertical: 'middle' };
    c6.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: isDone ? 'FF15803D' : 'FFD97706' } };
    c6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isDone ? 'FFDCFCE7' : 'FFFEF3C7' } };
    c6.border = cellBorder;
  });

  // 4. Summary Rows
  const totalRow = 5 + items.length;
  worksheet.mergeCells(`A${totalRow}:D${totalRow}`);
  const sLabel = worksheet.getCell(`A${totalRow}`);
  sLabel.value = isEn ? 'TOTAL ESTIMATED AMOUNT:' : 'JAMI MO\'LJALLANGAN SUMMA:';
  sLabel.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  sLabel.alignment = { horizontal: 'right', vertical: 'middle' };

  const sAmount = worksheet.getCell(`E${totalRow}`);
  sAmount.value = { formula: `SUM(E5:E${totalRow - 1})`, result: totalAmount };
  sAmount.numFmt = '#,##0;[Red]-#,##0;0';
  sAmount.font = { name: 'Segoe UI', size: 11.5, bold: true, color: { argb: 'FF0891B2' } };
  sAmount.alignment = { horizontal: 'right', vertical: 'middle' };

  for (let c = 1; c <= 6; c++) {
    const cell = worksheet.getCell(totalRow, c);
    cell.border = { top: { style: 'medium', color: { argb: 'FF0891B2' } }, bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  }

  // Paid & Remaining rows
  const paidRow = totalRow + 1;
  worksheet.mergeCells(`A${paidRow}:D${paidRow}`);
  worksheet.getCell(`A${paidRow}`).value = isEn ? 'PAID SO FAR:' : 'TO\'LANGAN SUMMA:';
  worksheet.getCell(`A${paidRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
  worksheet.getCell(`A${paidRow}`).font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF15803D' } };
  worksheet.getCell(`E${paidRow}`).value = paidAmount;
  worksheet.getCell(`E${paidRow}`).numFmt = '#,##0;[Red]-#,##0;0';
  worksheet.getCell(`E${paidRow}`).font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF15803D' } };
  worksheet.getCell(`E${paidRow}`).alignment = { horizontal: 'right', vertical: 'middle' };

  const debtRow = paidRow + 1;
  worksheet.mergeCells(`A${debtRow}:D${debtRow}`);
  worksheet.getCell(`A${debtRow}`).value = isEn ? 'REMAINING BALANCE:' : 'QOLGAN QARZ QOLDIG\'I:';
  worksheet.getCell(`A${debtRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
  worksheet.getCell(`A${debtRow}`).font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FFB91C1C' } };
  worksheet.getCell(`E${debtRow}`).value = remainingAmount;
  worksheet.getCell(`E${debtRow}`).numFmt = '#,##0;[Red]-#,##0;0';
  worksheet.getCell(`E${debtRow}`).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFDC2626' } };
  worksheet.getCell(`E${debtRow}`).alignment = { horizontal: 'right', vertical: 'middle' };

  // Set widths
  worksheet.getColumn(1).width = 6;  // #
  worksheet.getColumn(2).width = 16; // Category
  worksheet.getColumn(3).width = 10; // Tooth #
  worksheet.getColumn(4).width = 38; // Procedure
  worksheet.getColumn(5).width = 20; // Price
  worksheet.getColumn(6).width = 18; // Status

  // Write & trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `DentUz_Davolash_Rejasi_${planId}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
