import { downloadBlob, downloadText } from './downloadHelper';

export function formatFinanceDate(val, lang = 'uz') {
  if (!val) return '—';
  if (typeof val === 'string' && val.includes('-') && !val.includes('T')) return val;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const isEn = lang === 'en';
    const day = d.getDate();
    const monthsUz = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = (isEn ? monthsEn : monthsUz)[d.getMonth()];
    const year = d.getFullYear();
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${day}-${month}, ${year}${time !== '00:00' ? ` • ${time}` : ''}`;
  } catch {
    return val;
  }
}

/**
 * Exports financial invoices and summary to a professionally styled Excel (.xlsx) file
 * @param {Array} invoices - List of invoice objects
 * @param {Object} options - Filter, stats, and language options
 */
export async function exportFinanceToExcel(invoices = [], options = {}) {
  const ExcelJSModule = await import('exceljs');
  const ExcelJS = ExcelJSModule.default || ExcelJSModule;

  const {
    activeTab = 'all',
    dateRange = 'this_month',
    stats = null,
    language = 'uz',
    clinicName = 'DentUz Stomatologiya Klinikasi'
  } = options;

  const isEn = language === 'en';

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DentUz Financial System';
  workbook.lastModifiedBy = 'DentUz';
  workbook.created = new Date();
  workbook.modified = new Date();

  const sheetName = isEn ? 'Financial Ledger' : 'Moliya hisoboti';
  const worksheet = workbook.addWorksheet(sheetName, {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
    views: [{ state: 'frozen', ySplit: 5 }] // Freeze headers
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString(isEn ? 'en-US' : 'uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const tabLabels = {
    all: isEn ? 'All Invoices' : 'Barcha invoyslar',
    paid: isEn ? 'Paid Invoices' : 'To\'langan invoyslar',
    pending: isEn ? 'Pending Receivables' : 'Kutilayotgan qoldiqlar'
  };

  const rangeLabels = {
    today: isEn ? 'Today' : 'Bugun',
    this_week: isEn ? 'This Week' : 'Shu hafta',
    this_month: isEn ? 'This Month' : 'Shu oy',
    this_year: isEn ? 'This Year' : 'Shu yil'
  };

  const currentTab = tabLabels[activeTab] || activeTab;
  const currentRange = rangeLabels[dateRange] || dateRange;

  // 1. Title Banner (Row 1)
  worksheet.mergeCells('A1:I1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `${clinicName.toUpperCase()} — ${isEn ? 'FINANCIAL REPORT' : 'MOLIYA VA TO\'LOVLAR HISOBOTI'}`;
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F766E' } // Deep Medical Teal (#0F766E)
  };
  worksheet.getRow(1).height = 34;

  // 2. Subtitle / Metadata (Row 2)
  worksheet.mergeCells('A2:I2');
  const subCell = worksheet.getCell('A2');
  subCell.value = isEn
    ? `Period: ${currentRange} | Filter: ${currentTab} | Total Invoices: ${invoices.length} | Generated: ${dateStr} ${timeStr}`
    : `Davr: ${currentRange} | Filtr: ${currentTab} | Jami invoyslar: ${invoices.length} ta | Yuklangan vaqt: ${dateStr} ${timeStr}`;
  subCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF334155' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' }
  };
  worksheet.getRow(2).height = 22;

  // 3. Financial KPI Summary Cards (Row 3 & 4)
  if (stats) {
    const kpiBorder = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };

    // KPI 1: Total Revenue (A3:C3)
    worksheet.mergeCells('A3:C3');
    const kpi1 = worksheet.getCell('A3');
    kpi1.value = isEn
      ? `TOTAL REVENUE: ${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'} UZS`
      : `JAMI TUSHUM: ${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'} so'm`;
    kpi1.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF065F46' } };
    kpi1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
    kpi1.alignment = { horizontal: 'center', vertical: 'middle' };
    kpi1.border = kpiBorder;

    // KPI 2: Pending Receivables (D3:F3)
    worksheet.mergeCells('D3:F3');
    const kpi2 = worksheet.getCell('D3');
    kpi2.value = isEn
      ? `PENDING RECEIVABLES: ${stats.pendingReceivables ? stats.pendingReceivables.toLocaleString() : '0'} UZS`
      : `KUTILAYOTGAN QARZLAR: ${stats.pendingReceivables ? stats.pendingReceivables.toLocaleString() : '0'} so'm`;
    kpi2.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF991B1B' } };
    kpi2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
    kpi2.alignment = { horizontal: 'center', vertical: 'middle' };
    kpi2.border = kpiBorder;

    // KPI 3: Avg Invoice (G3:I3)
    worksheet.mergeCells('G3:I3');
    const kpi3 = worksheet.getCell('G3');
    kpi3.value = isEn
      ? `AVG INVOICE: ${stats.avgInvoice ? stats.avgInvoice.toLocaleString() : '0'} UZS`
      : `O'RTACHA CHEK: ${stats.avgInvoice ? stats.avgInvoice.toLocaleString() : '0'} so'm`;
    kpi3.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF1E40AF' } };
    kpi3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
    kpi3.alignment = { horizontal: 'center', vertical: 'middle' };
    kpi3.border = kpiBorder;

    worksheet.getRow(3).height = 24;
  }

  // Row 4 spacing
  worksheet.getRow(4).height = 10;

  // 4. Table Headers (Row 5)
  const headers = isEn
    ? ['Invoice #', 'Patient Full Name', 'Patient ID', 'Procedure / Treatment', 'Doctor', 'Date & Time', 'Payment Method', 'Amount (UZS)', 'Status']
    : ['Invoys #', 'Bemor F.I.SH', 'Bemor ID', 'Muolaja turi', 'Shifokor', 'Sana va Vaqt', 'To\'lov usuli', 'Summa (so\'m)', 'Holati'];

  const headerRow = worksheet.getRow(5);
  headerRow.values = headers;
  headerRow.height = 28;

  const headerBorder = {
    top: { style: 'thin', color: { argb: 'FF0F766E' } },
    left: { style: 'thin', color: { argb: 'FF0F766E' } },
    bottom: { style: 'medium', color: { argb: 'FF0F766E' } },
    right: { style: 'thin', color: { argb: 'FF0F766E' } }
  };

  headerRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F766E' } // Deep Teal
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: colNumber === 1 || colNumber === 3 || colNumber === 6 || colNumber === 7 || colNumber === 9 ? 'center' : colNumber === 8 ? 'right' : 'left'
    };
    cell.border = headerBorder;
  });

  worksheet.autoFilter = 'A5:I5';

  // 5. Data Rows
  let totalAmount = 0;
  let paidCount = 0;
  let pendingCount = 0;

  const cellBorder = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
  };

  invoices.forEach((item, idx) => {
    const rowNum = 6 + idx;
    const row = worksheet.getRow(rowNum);
    row.height = 24;

    const amountNum = Number(item.amount) || 0;
    totalAmount += amountNum;

    const isPaid = item.status === 'paid';
    if (isPaid) paidCount++;
    else pendingCount++;

    const statusText = isPaid
      ? (isEn ? 'Paid' : 'To\'langan')
      : (isEn ? 'Pending' : 'Kutilmoqda');

    row.values = [
      item.id || `INV-${idx + 1}`,
      item.patient || '',
      item.patientId ? `P-${item.patientId}` : '',
      item.procedure || '',
      item.doctor || '',
      formatFinanceDate(item.date, language),
      item.method || '',
      amountNum,
      statusText
    ];

    const isEven = idx % 2 === 0;
    const defaultBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    // Cell A: Invoice #
    const c1 = row.getCell(1);
    c1.font = { name: 'Consolas', size: 10, bold: true, color: { argb: 'FF0284C7' } };
    c1.alignment = { horizontal: 'center', vertical: 'middle' };
    c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    c1.border = cellBorder;

    // Cell B: Patient Name
    const c2 = row.getCell(2);
    c2.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF0F172A' } };
    c2.alignment = { horizontal: 'left', vertical: 'middle' };
    c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    c2.border = cellBorder;

    // Cell C: Patient ID
    const c3 = row.getCell(3);
    c3.font = { name: 'Consolas', size: 9.5, color: { argb: 'FF64748B' } };
    c3.alignment = { horizontal: 'center', vertical: 'middle' };
    c3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    c3.border = cellBorder;

    // Cell D: Procedure
    const c4 = row.getCell(4);
    c4.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF334155' } };
    c4.alignment = { horizontal: 'left', vertical: 'middle' };
    c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    c4.border = cellBorder;

    // Cell E: Doctor
    const c5 = row.getCell(5);
    c5.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF0F766E' } };
    c5.alignment = { horizontal: 'left', vertical: 'middle' };
    c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    c5.border = cellBorder;

    // Cell F: Date & Time
    const c6 = row.getCell(6);
    c6.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF334155' } };
    c6.alignment = { horizontal: 'center', vertical: 'middle' };
    c6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    c6.border = cellBorder;

    // Cell G: Method
    const c7 = row.getCell(7);
    c7.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF475569' } };
    c7.alignment = { horizontal: 'center', vertical: 'middle' };
    c7.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    c7.border = cellBorder;

    // Cell H: Amount
    const c8 = row.getCell(8);
    c8.value = amountNum;
    c8.numFmt = '#,##0;[Red]-#,##0;0';
    c8.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF0F172A' } };
    c8.alignment = { horizontal: 'right', vertical: 'middle' };
    c8.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    c8.border = cellBorder;

    // Cell I: Status
    const c9 = row.getCell(9);
    c9.font = {
      name: 'Segoe UI',
      size: 9.5,
      bold: true,
      color: { argb: isPaid ? 'FF15803D' : 'FFB45309' }
    };
    c9.alignment = { horizontal: 'center', vertical: 'middle' };
    c9.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isPaid ? 'FFDCFCE7' : 'FFFEF3C7' }
    };
    c9.border = cellBorder;
  });

  // 6. Totals Row
  const totalRowNum = 6 + invoices.length;
  worksheet.mergeCells(`A${totalRowNum}:G${totalRowNum}`);
  const summaryLabel = worksheet.getCell(`A${totalRowNum}`);
  summaryLabel.value = isEn
    ? `TOTAL INVOICES (${invoices.length}): ${paidCount} Paid, ${pendingCount} Pending`
    : `JAMI INVOYSLAR (${invoices.length} ta): ${paidCount} ta to'langan, ${pendingCount} ta kutilmoqda`;
  summaryLabel.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  summaryLabel.alignment = { horizontal: 'right', vertical: 'middle' };

  const summaryBorder = {
    top: { style: 'medium', color: { argb: 'FF0F766E' } },
    bottom: { style: 'double', color: { argb: 'FF0F766E' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
  };

  for (let c = 1; c <= 7; c++) {
    const cCell = worksheet.getCell(totalRowNum, c);
    cCell.border = summaryBorder;
    cCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  }

  const summaryAmount = worksheet.getCell(`H${totalRowNum}`);
  if (invoices.length > 0) {
    summaryAmount.value = { formula: `SUM(H6:H${totalRowNum - 1})`, result: totalAmount };
  } else {
    summaryAmount.value = 0;
  }
  summaryAmount.numFmt = '#,##0;[Red]-#,##0;0';
  summaryAmount.font = { name: 'Segoe UI', size: 11.5, bold: true, color: { argb: 'FF0F766E' } };
  summaryAmount.alignment = { horizontal: 'right', vertical: 'middle' };
  summaryAmount.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  summaryAmount.border = summaryBorder;

  const summaryStatusCell = worksheet.getCell(`I${totalRowNum}`);
  summaryStatusCell.value = '';
  summaryStatusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  summaryStatusCell.border = summaryBorder;

  worksheet.getRow(totalRowNum).height = 28;

  // 7. Hand-crafted, accurate column widths
  let maxNameLen = 26;
  let maxProcLen = 32;
  invoices.forEach((inv) => {
    if (inv.patient && inv.patient.length + 3 > maxNameLen) {
      maxNameLen = Math.min(inv.patient.length + 3, 38);
    }
    if (inv.procedure && inv.procedure.length + 3 > maxProcLen) {
      maxProcLen = Math.min(inv.procedure.length + 3, 42);
    }
  });

  worksheet.getColumn(1).width = 16; // Invoys # (INV-2026-001)
  worksheet.getColumn(2).width = maxNameLen; // Bemor F.I.SH
  worksheet.getColumn(3).width = 12; // Bemor ID (P-1042)
  worksheet.getColumn(4).width = maxProcLen; // Muolaja turi
  worksheet.getColumn(5).width = 20; // Shifokor
  worksheet.getColumn(6).width = 24; // Sana va Vaqt
  worksheet.getColumn(7).width = 16; // To'lov usuli
  worksheet.getColumn(8).width = 20; // Summa (so'm)
  worksheet.getColumn(9).width = 16; // Holati

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const suffix = activeTab !== 'all' ? `_${activeTab}` : '';
  const dateFormatted = now.toISOString().slice(0, 10);
  downloadBlob(blob, `DentUz_Moliya${suffix}_${dateFormatted}.xlsx`);
}

/**
 * Exports financial ledger to clean CSV
 */
export function exportFinanceToCSV(invoices = [], options = {}) {
  const { activeTab = 'all', language = 'uz' } = options;
  const isEn = language === 'en';

  const headers = isEn
    ? ['Invoice #', 'Patient Name', 'Patient ID', 'Procedure', 'Doctor', 'Date & Time', 'Payment Method', 'Amount (UZS)', 'Status']
    : ['Invoys #', 'Bemor F.I.SH', 'Bemor ID', 'Muolaja', 'Shifokor', 'Sana va Vaqt', 'To\'lov usuli', 'Summa (so\'m)', 'Holati'];

  const rows = invoices.map((inv) => [
    `"${inv.id || ''}"`,
    `"${(inv.patient || '').replace(/"/g, '""')}"`,
    `"${inv.patientId ? 'P-' + inv.patientId : ''}"`,
    `"${(inv.procedure || '').replace(/"/g, '""')}"`,
    `"${(inv.doctor || '').replace(/"/g, '""')}"`,
    `"${formatFinanceDate(inv.date, language)}"`,
    `"${inv.method || ''}"`,
    Number(inv.amount) || 0,
    `"${inv.status === 'paid' ? (isEn ? 'Paid' : 'To\'langan') : (isEn ? 'Pending' : 'Kutilmoqda')}"`
  ]);

  const csvContent = '\uFEFFsep=,\r\n' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const suffix = activeTab !== 'all' ? `_${activeTab}` : '';
  const dateFormatted = new Date().toISOString().slice(0, 10);
  downloadText(csvContent, `DentUz_Moliya${suffix}_${dateFormatted}.csv`);
}

/**
 * Exports financial ledger to styled Word (.doc) document
 */
export function exportFinanceToWord(invoices = [], options = {}) {
  const { activeTab = 'all', dateRange = 'this_month', stats = null, language = 'uz', clinicName = 'DentUz Stomatologiya Klinikasi' } = options;
  const isEn = language === 'en';

  const now = new Date();
  const dateStr = now.toLocaleDateString(isEn ? 'en-US' : 'uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let totalAmount = 0;
  let paidCount = 0;

  const rowsHtml = invoices.map((inv, idx) => {
    const amountNum = Number(inv.amount) || 0;
    totalAmount += amountNum;
    const isPaid = inv.status === 'paid';
    if (isPaid) paidCount++;

    return `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace; font-weight: bold; color: #0284c7;">${inv.id || ''}</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; font-weight: 600;">${inv.patient || ''} <span style="color:#64748b; font-size:8pt;">(${inv.patientId ? 'P-' + inv.patientId : ''})</span></td>
        <td style="padding: 7px; border: 1px solid #cbd5e1;">${inv.procedure || ''}</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; color: #0f766e;">${inv.doctor || ''}</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center;">${inv.date || ''}</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center;">${inv.method || ''}</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${amountNum.toLocaleString()} so'm</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${isPaid ? '#15803d' : '#b45309'}; background: ${isPaid ? '#dcfce7' : '#fef3c7'};">${isPaid ? 'To\'langan' : 'Kutilmoqda'}</td>
      </tr>
    `;
  }).join('');

  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${clinicName} - Moliya hisoboti</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20mm 15mm; color: #1e293b; font-size: 10pt; }
        .header-title { text-align: center; font-size: 16pt; font-weight: bold; color: #0f766e; text-transform: uppercase; margin-bottom: 4px; }
        .header-sub { text-align: center; font-size: 10pt; color: #64748b; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #0f766e; color: #ffffff; padding: 8px 10px; font-size: 10pt; border: 1px solid #0f766e; text-align: left; }
        .kpi-strip { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 14px; background-color: #f1f5f9; border-left: 4px solid #0f766e; }
      </style>
    </head>
    <body>
      <div class="header-title">${clinicName}</div>
      <div class="header-sub">${isEn ? 'FINANCIAL TRANSACTIONS & REVENUE REPORT' : 'MOLIYAVIY TO\'LOVLAR VA TUSHUMLAR HISOBOTI'}</div>
      <div class="kpi-strip">
        <strong>${isEn ? 'Period' : 'Hisobot davri'}:</strong> ${dateRange} |
        <strong>${isEn ? 'Total Invoices' : 'Jami invoyslar'}:</strong> ${invoices.length} ta (${paidCount} ta to'langan) |
        <strong>${isEn ? 'Total Amount' : 'Jami summa'}:</strong> ${totalAmount.toLocaleString()} so'm |
        <strong>${isEn ? 'Date' : 'Sana'}:</strong> ${dateStr} ${timeStr}
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: center; width: 10%;">Invoys #</th>
            <th style="width: 20%;">Bemor F.I.SH</th>
            <th style="width: 22%;">Muolaja</th>
            <th style="width: 14%;">Shifokor</th>
            <th style="text-align: center; width: 12%;">Sana</th>
            <th style="text-align: center; width: 8%;">To'lov</th>
            <th style="text-align: right; width: 14%;">Summa</th>
            <th style="text-align: center; width: 10%;">Holat</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + docHtml], { type: 'application/msword;charset=utf-8;' });
  const suffix = activeTab !== 'all' ? `_${activeTab}` : '';
  const dateFormatted = now.toISOString().slice(0, 10);
  downloadBlob(blob, `DentUz_Moliya${suffix}_${dateFormatted}.doc`);
}

/**
 * Printable view for saving Financial report as PDF
 */
export function exportFinanceToPDF(invoices = [], options = {}) {
  const { activeTab = 'all', dateRange = 'this_month', language = 'uz', clinicName = 'DentUz Stomatologiya Klinikasi' } = options;
  const isEn = language === 'en';

  const now = new Date();
  const dateStr = now.toLocaleDateString(isEn ? 'en-US' : 'uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let totalAmount = 0;
  let paidCount = 0;

  const rowsHtml = invoices.map((inv, idx) => {
    const amountNum = Number(inv.amount) || 0;
    totalAmount += amountNum;
    const isPaid = inv.status === 'paid';
    if (isPaid) paidCount++;

    return `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; font-family: monospace; font-weight: bold; color: #0284c7;">${inv.id || ''}</td>
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-weight: 600;">${inv.patient || ''} <span style="color:#64748b; font-size:8pt;">(${inv.patientId ? 'P-' + inv.patientId : ''})</span></td>
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">${inv.procedure || ''}</td>
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0; color: #0f766e;">${inv.doctor || ''}</td>
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${inv.date || ''}</td>
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">${inv.method || ''}</td>
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${amountNum.toLocaleString()} so'm</td>
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${isPaid ? '#15803d' : '#b45309'}; background: ${isPaid ? '#dcfce7' : '#fef3c7'};">${isPaid ? 'To\'langan' : 'Kutilmoqda'}</td>
      </tr>
    `;
  }).join('');

  const htmlDoc = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${clinicName} - Moliya PDF Hisoboti</title>
      <style>
        @page { size: A4 landscape; margin: 12mm 10mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 15px; font-size: 11px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 12px; }
        .brand { font-size: 18px; font-weight: 800; color: #0f766e; }
        .doc-title { font-size: 13px; font-weight: 700; color: #334155; }
        .meta-strip { display: flex; gap: 20px; font-size: 11px; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th { background: #0f766e; color: #fff; padding: 7px 8px; text-align: left; font-weight: 700; border: 1px solid #0f766e; }
        td { border: 1px solid #e2e8f0; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; padding-top: 15px; border-top: 1px solid #cbd5e1; page-break-inside: avoid; }
        @media print { body { padding: 0; } .no-print { display: none !important; } }
      </style>
    </head>
    <body>
      <div class="no-print" style="position: sticky; top: 0; background: #0f172a; color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; margin: -15px -15px 15px -15px;">
        <div style="font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px;">
          <span>💰</span> <span>DentUz Dental OS &mdash; Rasmiy Moliya Hisoboti (PDF)</span>
        </div>
        <div style="display: flex; gap: 10px;">
          <button onclick="window.print()" style="background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            🖨️ Chop etish / PDF saqlash
          </button>
          <button onclick="window.close()" style="background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 8px 14px; border-radius: 6px; font-weight: 500; cursor: pointer;">
            ✕ Yopish
          </button>
        </div>
      </div>
      <div class="header">
        <div>
          <div class="brand">${clinicName.toUpperCase()}</div>
          <div style="font-size: 10px; color: #64748b;">Dental Financial Ledger & Billing System</div>
        </div>
        <div style="text-align: right;">
          <div class="doc-title">${isEn ? 'OFFICIAL FINANCIAL REPORT' : 'RASMIY MOLIYA HISOBOTI'}</div>
          <div style="font-size: 10px; color: #64748b;">${dateStr} ${timeStr}</div>
        </div>
      </div>

      <div class="meta-strip">
        <div><strong>${isEn ? 'Period' : 'Davr'}:</strong> ${dateRange}</div>
        <div><strong>${isEn ? 'Total Invoices' : 'Jami invoyslar'}:</strong> ${invoices.length} ta (${paidCount} ta to'langan)</div>
        <div><strong>${isEn ? 'Total Turnover' : 'Umumiy aylanma'}:</strong> ${totalAmount.toLocaleString()} so'm</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: center; width: 10%;">Invoys #</th>
            <th style="width: 20%;">Bemor F.I.SH</th>
            <th style="width: 22%;">Muolaja turi</th>
            <th style="width: 14%;">Shifokor</th>
            <th style="text-align: center; width: 12%;">Sana</th>
            <th style="text-align: center; width: 8%;">To'lov</th>
            <th style="text-align: right; width: 14%;">Summa</th>
            <th style="text-align: center; width: 10%;">Holat</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        <div>Bosh hisobchi: _______________________ (F.I.SH)</div>
        <div>Bosh shifokor: _______________________ (Dr. J. Azimov) &nbsp;&nbsp;&nbsp; Muhr o'rni (M.P.)</div>
      </div>
    </body>
    </html>
  `;

  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlDoc);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (e) {
          console.warn('Auto-print blocked, user can print via button:', e);
        }
      }, 500);
      return;
    }
  } catch (e) {
    // Popup blocked, fallback to iframe
  }

  // Fallback: Invisible iframe to trigger print without popup blocker
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(htmlDoc);
  iframe.contentWindow.document.close();
  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1500);
  }, 400);
}
