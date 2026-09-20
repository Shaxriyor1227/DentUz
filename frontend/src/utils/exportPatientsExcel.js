import ExcelJS from 'exceljs';

/**
 * Exports patients list to a professionally styled Excel (.xlsx) file
 * @param {Array} patients - List of patient objects
 * @param {Object} options - Filter and language options
 */
export async function exportPatientsToExcel(patients = [], options = {}) {
  const {
    filter = 'all',
    language = 'uz',
    clinicName = 'DentUz Stomatologiya Klinikasi'
  } = options;

  const isEn = language === 'en';

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DentUz Dental System';
  workbook.lastModifiedBy = 'DentUz';
  workbook.created = new Date();
  workbook.modified = new Date();

  const sheetName = isEn ? 'Patients' : 'Bemorlar';
  const worksheet = workbook.addWorksheet(sheetName, {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
    views: [{ state: 'frozen', ySplit: 4 }] // Freeze header row
  });

  // Filter labels
  const filterLabels = {
    all: isEn ? 'All Patients' : 'Barcha bemorlar',
    debtors: isEn ? 'Debtors only' : 'Faqat qarzdorlar',
    today: isEn ? 'Today\'s appointments' : 'Bugungi qabullar',
    recent: isEn ? 'Recent visits' : 'Yaqinda tashrif buyurganlar'
  };
  const activeFilterText = filterLabels[filter] || filter;

  const now = new Date();
  const dateStr = now.toLocaleDateString(isEn ? 'en-US' : 'uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Title Banner (Row 1)
  worksheet.mergeCells('A1:G1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = clinicName.toUpperCase();
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0891B2' } // Deep Cyan (#0891B2)
  };
  worksheet.getRow(1).height = 32;

  // 2. Subtitle / Metadata (Row 2)
  worksheet.mergeCells('A2:G2');
  const subtitleCell = worksheet.getCell('A2');
  subtitleCell.value = isEn
    ? `Patient List Report | Filter: ${activeFilterText} | Total: ${patients.length} records | Generated: ${dateStr} ${timeStr}`
    : `Bemorlar ro'yxati hisoboti | Filtr: ${activeFilterText} | Jami: ${patients.length} ta bemor | Yuklangan vaqt: ${dateStr} ${timeStr}`;
  subtitleCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF334155' } };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  subtitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' } // Light slate (#F1F5F9)
  };
  worksheet.getRow(2).height = 22;

  // 3. Blank spacing row (Row 3)
  worksheet.getRow(3).height = 10;

  // 4. Table Headers (Row 4)
  const headers = isEn
    ? ['ID', 'Patient Full Name', 'Phone Number', 'Last Visit / Procedure', 'Next Appointment', 'Balance (UZS)', 'Status']
    : ['ID', 'Bemor F.I.SH', 'Telefon raqami', 'Oxirgi tashrif va muolaja', 'Keyingi qabul', 'Balans (so\'m)', 'Holati'];

  const headerRow = worksheet.getRow(4);
  headerRow.values = headers;
  headerRow.height = 28;

  const headerBorder = {
    top: { style: 'thin', color: { argb: 'FF0E7490' } },
    left: { style: 'thin', color: { argb: 'FF0E7490' } },
    bottom: { style: 'medium', color: { argb: 'FF0E7490' } },
    right: { style: 'thin', color: { argb: 'FF0E7490' } }
  };

  headerRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0E7490' } // Slate-Cyan Header (#0E7490)
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: colNumber === 1 || colNumber === 3 || colNumber === 5 || colNumber === 7 ? 'center' : colNumber === 6 ? 'right' : 'left'
    };
    cell.border = headerBorder;
  });

  // Enable AutoFilter on header row
  worksheet.autoFilter = 'A4:G4';

  // 5. Data Rows
  let totalDebt = 0;
  let debtorsCount = 0;

  const cellBorder = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
  };

  patients.forEach((p, idx) => {
    const rowNum = 5 + idx;
    const row = worksheet.getRow(rowNum);
    row.height = 24;

    const balanceNum = p.balance ? -Math.abs(Number(p.balance)) : 0;
    const isDebtor = balanceNum < 0;
    if (isDebtor) {
      totalDebt += Math.abs(balanceNum);
      debtorsCount++;
    }

    const lastVisitText = [p.lastVisit, p.lastProcedure].filter(Boolean).join(' - ') || (isEn ? 'No visits yet' : 'Tashriflar yo\'q');
    const nextVisitText = p.nextVisit || (isEn ? 'Not scheduled' : 'Rejalashtirilmagan');
    const statusText = isDebtor
      ? (isEn ? 'Has Debt' : 'Qarzdorlik bor')
      : (isEn ? 'Settled' : 'To\'langan / Qarzsiz');

    row.values = [
      p.id || `P-${idx + 1}`,
      p.name || '',
      p.phone || '',
      lastVisitText,
      nextVisitText,
      balanceNum,
      statusText
    ];

    // Zebra striping background
    const isEven = idx % 2 === 0;
    const defaultBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    // Cell A: ID
    const cellA = row.getCell(1);
    cellA.font = { name: 'Consolas', size: 10, bold: true, color: { argb: 'FF0284C7' } };
    cellA.alignment = { horizontal: 'center', vertical: 'middle' };
    cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    cellA.border = cellBorder;

    // Cell B: Name
    const cellB = row.getCell(2);
    cellB.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF0F172A' } };
    cellB.alignment = { horizontal: 'left', vertical: 'middle' };
    cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    cellB.border = cellBorder;

    // Cell C: Phone
    const cellC = row.getCell(3);
    cellC.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF334155' } };
    cellC.alignment = { horizontal: 'center', vertical: 'middle' };
    cellC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    cellC.border = cellBorder;

    // Cell D: Last Visit
    const cellD = row.getCell(4);
    cellD.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF334155' } };
    cellD.alignment = { horizontal: 'left', vertical: 'middle' };
    cellD.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    cellD.border = cellBorder;

    // Cell E: Next Visit
    const cellE = row.getCell(5);
    cellE.font = { name: 'Segoe UI', size: 10, color: { argb: p.nextVisit ? 'FF0F766E' : 'FF94A3B8' } };
    cellE.alignment = { horizontal: 'center', vertical: 'middle' };
    cellE.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    cellE.border = cellBorder;

    // Cell F: Balance
    const cellF = row.getCell(6);
    cellF.value = balanceNum;
    cellF.numFmt = '#,##0;[Red]-#,##0;0';
    cellF.font = {
      name: 'Segoe UI',
      size: 10.5,
      bold: isDebtor,
      color: { argb: isDebtor ? 'FFDC2626' : 'FF16A34A' }
    };
    cellF.alignment = { horizontal: 'right', vertical: 'middle' };
    cellF.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isDebtor ? 'FFFEE2E2' : defaultBg }
    };
    cellF.border = cellBorder;

    // Cell G: Status
    const cellG = row.getCell(7);
    cellG.font = {
      name: 'Segoe UI',
      size: 9.5,
      bold: true,
      color: { argb: isDebtor ? 'FFB91C1C' : 'FF15803D' }
    };
    cellG.alignment = { horizontal: 'center', vertical: 'middle' };
    cellG.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isDebtor ? 'FFFEE2E2' : 'FFDCFCE7' }
    };
    cellG.border = cellBorder;
  });

  // 6. Summary / Total Row
  const totalRowNum = 5 + patients.length;
  worksheet.mergeCells(`A${totalRowNum}:E${totalRowNum}`);
  const summaryLabel = worksheet.getCell(`A${totalRowNum}`);
  summaryLabel.value = isEn
    ? `TOTAL: ${patients.length} patients (${debtorsCount} with outstanding debt)`
    : `JAMI: ${patients.length} ta bemor (${debtorsCount} ta qarzdor)`;
  summaryLabel.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  summaryLabel.alignment = { horizontal: 'right', vertical: 'middle' };

  const summaryBorder = {
    top: { style: 'medium', color: { argb: 'FF0E7490' } },
    bottom: { style: 'double', color: { argb: 'FF0E7490' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
  };

  for (let c = 1; c <= 5; c++) {
    const cCell = worksheet.getCell(totalRowNum, c);
    cCell.border = summaryBorder;
    cCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  }

  const summaryBalance = worksheet.getCell(`F${totalRowNum}`);
  if (patients.length > 0) {
    summaryBalance.value = { formula: `SUM(F5:F${totalRowNum - 1})`, result: -totalDebt };
  } else {
    summaryBalance.value = 0;
  }
  summaryBalance.numFmt = '#,##0;[Red]-#,##0;0';
  summaryBalance.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: totalDebt > 0 ? 'FFDC2626' : 'FF16A34A' } };
  summaryBalance.alignment = { horizontal: 'right', vertical: 'middle' };
  summaryBalance.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: totalDebt > 0 ? 'FFFEE2E2' : 'FFF1F5F9' } };
  summaryBalance.border = summaryBorder;

  const summaryStatus = worksheet.getCell(`G${totalRowNum}`);
  summaryStatus.value = '';
  summaryStatus.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  summaryStatus.border = summaryBorder;

  worksheet.getRow(totalRowNum).height = 26;

  // 7. Column Widths (Hand-crafted, clean proportions - ID is compact, Name is prominent)
  // ID: 10 (compact, neat, perfectly fits "P-1042" and "ID")
  // Name: 28-36 (spacious, fits full names clearly)
  // Phone: 19 (fits "+998 90 842 11 00")
  // Last Visit: 32 (fits date & procedure)
  // Next Appointment: 25 (fits "Next Appointment" header and dates without cutting off)
  // Balance: 18 (fits numbers with currency)
  // Status: 18 (fits status badge text)
  let maxNameLength = 28;
  patients.forEach((p) => {
    if (p.name && p.name.length + 3 > maxNameLength) {
      maxNameLength = Math.min(p.name.length + 3, 38);
    }
  });

  worksheet.getColumn(1).width = 10; // ID: strictly 10, compact and clear
  worksheet.getColumn(2).width = maxNameLength; // Name: prominent
  worksheet.getColumn(3).width = 19; // Phone
  worksheet.getColumn(4).width = 32; // Last Visit
  worksheet.getColumn(5).width = 25; // Next Appt: fully visible
  worksheet.getColumn(6).width = 18; // Balance
  worksheet.getColumn(7).width = 18; // Status

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filterSuffix = filter !== 'all' ? `_${filter}` : '';
  const dateFormatted = now.toISOString().slice(0, 10);
  link.setAttribute('download', `DentUz_Bemorlar${filterSuffix}_${dateFormatted}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
