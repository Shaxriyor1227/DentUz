/**
 * Utilities for exporting Patients list to Word (.doc) and printable PDF
 */

/**
 * Exports patients list to a professionally styled Microsoft Word / WPS Writer (.doc) file
 * @param {Array} patients - List of patient objects
 * @param {Object} options - Filter and language options
 */
export function exportPatientsToWord(patients = [], options = {}) {
  const {
    filter = 'all',
    language = 'uz',
    clinicName = 'DentUz Stomatologiya Klinikasi'
  } = options;

  const isEn = language === 'en';

  const filterLabels = {
    all: isEn ? 'All Patients' : 'Barcha bemorlar',
    today: isEn ? 'Today\'s Visits' : 'Bugungi qabullar',
    scheduled: isEn ? 'Scheduled' : 'Rejalashtirilgan',
    debtor: isEn ? 'Debtors' : 'Qarzdorlar'
  };
  const activeFilterText = filterLabels[filter] || filter;

  const now = new Date();
  const dateStr = now.toLocaleDateString(isEn ? 'en-US' : 'uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let debtorsCount = 0;
  let totalDebt = 0;

  const rowsHtml = patients.map((p, idx) => {
    const balanceNum = p.balance ? -Math.abs(Number(p.balance)) : 0;
    const isDebtor = balanceNum < 0;
    if (isDebtor) {
      debtorsCount++;
      totalDebt += Math.abs(balanceNum);
    }

    const lastVisitText = [p.lastVisit, p.lastProcedure].filter(Boolean).join(' - ') || (isEn ? 'No visits' : 'Tashriflar yo\'q');
    const nextVisitText = p.nextVisit || (isEn ? 'Not scheduled' : 'Rejalashtirilmagan');
    const statusText = isDebtor ? (isEn ? 'Has Debt' : 'Qarzdor') : (isEn ? 'Paid' : 'To\'langan');

    return `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 7px 10px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace; font-weight: bold; color: #0284c7;">${p.id || `P-${idx + 1}`}</td>
        <td style="padding: 7px 10px; border: 1px solid #cbd5e1; font-weight: 600; color: #0f172a;">${p.name || ''}</td>
        <td style="padding: 7px 10px; border: 1px solid #cbd5e1; text-align: center; color: #334155;">${p.phone || ''}</td>
        <td style="padding: 7px 10px; border: 1px solid #cbd5e1; color: #334155;">${lastVisitText}</td>
        <td style="padding: 7px 10px; border: 1px solid #cbd5e1; text-align: center; color: ${p.nextVisit ? '#0f766e' : '#94a3b8'};">${nextVisitText}</td>
        <td style="padding: 7px 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: ${isDebtor ? 'bold' : 'normal'}; color: ${isDebtor ? '#dc2626' : '#16a34a'};">${balanceNum.toLocaleString()} so'm</td>
        <td style="padding: 7px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${isDebtor ? '#b91c1c' : '#15803d'}; background-color: ${isDebtor ? '#fee2e2' : '#dcfce7'};">${statusText}</td>
      </tr>
    `;
  }).join('');

  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${clinicName} - Bemorlar hisoboti</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20mm 15mm; color: #1e293b; font-size: 10pt; }
        .header-title { text-align: center; font-size: 16pt; font-weight: bold; color: #0f766e; text-transform: uppercase; margin-bottom: 4px; }
        .header-sub { text-align: center; font-size: 10pt; color: #64748b; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #0f766e; color: #ffffff; padding: 8px 10px; font-size: 10pt; border: 1px solid #0f766e; text-align: left; }
        .kpi-box { margin-bottom: 15px; padding: 10px 14px; background-color: #f1f5f9; border-left: 4px solid #0f766e; font-size: 9.5pt; }
        .signatures { margin-top: 40px; width: 100%; }
      </style>
    </head>
    <body>
      <div class="header-title">${clinicName}</div>
      <div class="header-sub">${isEn ? 'PATIENT DIRECTORY & CLINICAL REPORT' : 'BEMORLAR RO\'YXATI VA KLINIKA HISOBOTI'}</div>

      <div class="kpi-box">
        <strong>${isEn ? 'Report Summary:' : 'Hisobot xulosasi:'}</strong>
        ${isEn ? 'Filter' : 'Filtr'}: <u>${activeFilterText}</u> &nbsp;|&nbsp;
        ${isEn ? 'Total Patients' : 'Jami bemorlar'}: <strong>${patients.length}</strong> ta &nbsp;|&nbsp;
        ${isEn ? 'Debtors' : 'Qarzdorlar'}: <strong>${debtorsCount}</strong> ta (${totalDebt.toLocaleString()} so'm) &nbsp;|&nbsp;
        ${isEn ? 'Exported on' : 'Sana'}: ${dateStr} ${timeStr}
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: center; width: 8%;">ID</th>
            <th style="width: 24%;">${isEn ? 'Patient Full Name' : 'Bemor F.I.SH'}</th>
            <th style="text-align: center; width: 16%;">${isEn ? 'Phone' : 'Telefon'}</th>
            <th style="width: 22%;">${isEn ? 'Last Visit / Procedure' : 'Oxirgi tashrif va muolaja'}</th>
            <th style="text-align: center; width: 14%;">${isEn ? 'Next Visit' : 'Keyingi qabul'}</th>
            <th style="text-align: right; width: 16%;">${isEn ? 'Balance' : 'Balans'}</th>
            <th style="text-align: center; width: 10%;">${isEn ? 'Status' : 'Holat'}</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <table class="signatures" style="border: none; margin-top: 40px;">
        <tr style="background: none;">
          <td style="border: none; width: 50%; font-size: 10pt;">
            <strong>${isEn ? 'Chief Physician' : 'Bosh shifokor'}:</strong> _______________________ (Dr. J. Azimov)
          </td>
          <td style="border: none; width: 50%; text-align: right; font-size: 10pt;">
            <strong>${isEn ? 'Stamp (M.P.) / Signature' : 'Muhr o\'rni (M.P.) / Imzo'}:</strong> _______________________
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + docHtml], { type: 'application/msword;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filterSuffix = filter !== 'all' ? `_${filter}` : '';
  const dateFormatted = now.toISOString().slice(0, 10);
  link.setAttribute('download', `DentUz_Bemorlar${filterSuffix}_${dateFormatted}.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers a dedicated, clean printable view for saving as PDF or printing
 * @param {Array} patients - List of patient objects
 * @param {Object} options - Filter and language options
 */
export function exportPatientsToPDF(patients = [], options = {}) {
  const {
    filter = 'all',
    language = 'uz',
    clinicName = 'DentUz Stomatologiya Klinikasi'
  } = options;

  const isEn = language === 'en';

  const filterLabels = {
    all: isEn ? 'All Patients' : 'Barcha bemorlar',
    today: isEn ? 'Today\'s Visits' : 'Bugungi qabullar',
    scheduled: isEn ? 'Scheduled' : 'Rejalashtirilgan',
    debtor: isEn ? 'Debtors' : 'Qarzdorlar'
  };
  const activeFilterText = filterLabels[filter] || filter;

  const now = new Date();
  const dateStr = now.toLocaleDateString(isEn ? 'en-US' : 'uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let debtorsCount = 0;
  let totalDebt = 0;

  const rowsHtml = patients.map((p, idx) => {
    const balanceNum = p.balance ? -Math.abs(Number(p.balance)) : 0;
    const isDebtor = balanceNum < 0;
    if (isDebtor) {
      debtorsCount++;
      totalDebt += Math.abs(balanceNum);
    }

    const lastVisitText = [p.lastVisit, p.lastProcedure].filter(Boolean).join(' - ') || (isEn ? 'No visits' : 'Tashriflar yo\'q');
    const nextVisitText = p.nextVisit || (isEn ? 'Not scheduled' : 'Rejalashtirilmagan');
    const statusText = isDebtor ? (isEn ? 'Has Debt' : 'Qarzdor') : (isEn ? 'Paid' : 'To\'langan');

    return `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; font-family: monospace; font-weight: bold; color: #0284c7;">${p.id || `P-${idx + 1}`}</td>
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${p.name || ''}</td>
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; color: #334155;">${p.phone || ''}</td>
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0; color: #334155;">${lastVisitText}</td>
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; color: ${p.nextVisit ? '#0f766e' : '#94a3b8'};">${nextVisitText}</td>
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: ${isDebtor ? 'bold' : 'normal'}; color: ${isDebtor ? '#dc2626' : '#16a34a'};">${balanceNum.toLocaleString()} so'm</td>
        <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${isDebtor ? '#b91c1c' : '#15803d'}; background-color: ${isDebtor ? '#fee2e2' : '#dcfce7'};">${statusText}</td>
      </tr>
    `;
  }).join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert(isEn ? 'Please allow popups to open the print dialog.' : 'Iltimos, chop etish oynasini ochish uchun brauzerda pop-up ruxsatini bering.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${clinicName} - PDF Hisobot</title>
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
        @media print {
          body { padding: 0; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">${clinicName.toUpperCase()}</div>
          <div style="font-size: 10px; color: #64748b;">Dental Clinic Operating System</div>
        </div>
        <div style="text-align: right;">
          <div class="doc-title">${isEn ? 'OFFICIAL PATIENT DIRECTORY' : 'RASMIY BEMORLAR HISOBOTI'}</div>
          <div style="font-size: 10px; color: #64748b;">${dateStr} ${timeStr}</div>
        </div>
      </div>

      <div class="meta-strip">
        <div>${isEn ? 'Filter' : 'Filtr'}: <strong>${activeFilterText}</strong></div>
        <div>${isEn ? 'Total Patients' : 'Jami bemorlar'}: <strong>${patients.length} ta</strong></div>
        <div>${isEn ? 'Outstanding Debtors' : 'Qarzdorlar'}: <strong>${debtorsCount} ta</strong> (${totalDebt.toLocaleString()} so'm)</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: center; width: 7%;">ID</th>
            <th style="width: 25%;">${isEn ? 'Patient Full Name' : 'Bemor F.I.SH'}</th>
            <th style="text-align: center; width: 15%;">${isEn ? 'Phone' : 'Telefon'}</th>
            <th style="width: 23%;">${isEn ? 'Last Visit / Procedure' : 'Oxirgi tashrif va muolaja'}</th>
            <th style="text-align: center; width: 14%;">${isEn ? 'Next Visit' : 'Keyingi qabul'}</th>
            <th style="text-align: right; width: 16%;">${isEn ? 'Balance' : 'Balans'}</th>
            <th style="text-align: center; width: 10%;">${isEn ? 'Status' : 'Holat'}</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        <div>${isEn ? 'Responsible Physician' : 'Mas\'ul shifokor'}: <strong>Dr. J. Azimov</strong> __________________</div>
        <div>${isEn ? 'Clinic Stamp & Seal (M.P.)' : 'Klinika muhri (M.P.)'} __________________</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
