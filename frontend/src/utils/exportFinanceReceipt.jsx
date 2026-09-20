import React from 'react';

/**
 * DentUz - Professional Dental Receipt & Fiscal Check Printing Engine
 * Generates authentic 80mm thermal receipts and A4 medical fiscal invoices
 */

export function ReceiptBarcode({ code = 'INV-2026-008', width = 200, height = 36 }) {
  const cleanCode = code.replace(/[^A-Za-z0-9]/g, '');
  return (
    <div style={{ textAlign: 'center', margin: '6px auto 2px auto' }}>
      <svg width={width} height={height} viewBox="0 0 220 38" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
        <rect x="10" y="0" width="3" height="28" fill="#111827"/>
        <rect x="15" y="0" width="2" height="28" fill="#111827"/>
        <rect x="20" y="0" width="4" height="28" fill="#111827"/>
        <rect x="27" y="0" width="2" height="28" fill="#111827"/>
        <rect x="32" y="0" width="5" height="28" fill="#111827"/>
        <rect x="40" y="0" width="2" height="28" fill="#111827"/>
        <rect x="45" y="0" width="3" height="28" fill="#111827"/>
        <rect x="51" y="0" width="4" height="28" fill="#111827"/>
        <rect x="58" y="0" width="2" height="28" fill="#111827"/>
        <rect x="63" y="0" width="6" height="28" fill="#111827"/>
        <rect x="72" y="0" width="2" height="28" fill="#111827"/>
        <rect x="77" y="0" width="3" height="28" fill="#111827"/>
        <rect x="83" y="0" width="5" height="28" fill="#111827"/>
        <rect x="91" y="0" width="2" height="28" fill="#111827"/>
        <rect x="96" y="0" width="4" height="28" fill="#111827"/>
        <rect x="103" y="0" width="2" height="28" fill="#111827"/>
        <rect x="108" y="0" width="5" height="28" fill="#111827"/>
        <rect x="116" y="0" width="3" height="28" fill="#111827"/>
        <rect x="122" y="0" width="2" height="28" fill="#111827"/>
        <rect x="127" y="0" width="6" height="28" fill="#111827"/>
        <rect x="136" y="0" width="2" height="28" fill="#111827"/>
        <rect x="141" y="0" width="4" height="28" fill="#111827"/>
        <rect x="148" y="0" width="3" height="28" fill="#111827"/>
        <rect x="154" y="0" width="5" height="28" fill="#111827"/>
        <rect x="162" y="0" width="2" height="28" fill="#111827"/>
        <rect x="167" y="0" width="3" height="28" fill="#111827"/>
        <rect x="173" y="0" width="6" height="28" fill="#111827"/>
        <rect x="182" y="0" width="2" height="28" fill="#111827"/>
        <rect x="187" y="0" width="4" height="28" fill="#111827"/>
        <rect x="194" y="0" width="2" height="28" fill="#111827"/>
        <rect x="199" y="0" width="5" height="28" fill="#111827"/>
        <rect x="207" y="0" width="3" height="28" fill="#111827"/>
        <text x="110" y="37" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#4B5563">{cleanCode}</text>
      </svg>
    </div>
  );
}

function getRawBarcodeSvg(code = 'INV2026008') {
  return `
    <svg width="210" height="38" viewBox="0 0 220 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="0" width="3" height="26" fill="#000000"/>
      <rect x="15" y="0" width="2" height="26" fill="#000000"/>
      <rect x="20" y="0" width="4" height="26" fill="#000000"/>
      <rect x="27" y="0" width="2" height="26" fill="#000000"/>
      <rect x="32" y="0" width="5" height="26" fill="#000000"/>
      <rect x="40" y="0" width="2" height="26" fill="#000000"/>
      <rect x="45" y="0" width="3" height="26" fill="#000000"/>
      <rect x="51" y="0" width="4" height="26" fill="#000000"/>
      <rect x="58" y="0" width="2" height="26" fill="#000000"/>
      <rect x="63" y="0" width="6" height="26" fill="#000000"/>
      <rect x="72" y="0" width="2" height="26" fill="#000000"/>
      <rect x="77" y="0" width="3" height="26" fill="#000000"/>
      <rect x="83" y="0" width="5" height="26" fill="#000000"/>
      <rect x="91" y="0" width="2" height="26" fill="#000000"/>
      <rect x="96" y="0" width="4" height="26" fill="#000000"/>
      <rect x="103" y="0" width="2" height="26" fill="#000000"/>
      <rect x="108" y="0" width="5" height="26" fill="#000000"/>
      <rect x="116" y="0" width="3" height="26" fill="#000000"/>
      <rect x="122" y="0" width="2" height="26" fill="#000000"/>
      <rect x="127" y="0" width="6" height="26" fill="#000000"/>
      <rect x="136" y="0" width="2" height="26" fill="#000000"/>
      <rect x="141" y="0" width="4" height="26" fill="#000000"/>
      <rect x="148" y="0" width="3" height="26" fill="#000000"/>
      <rect x="154" y="0" width="5" height="26" fill="#000000"/>
      <rect x="162" y="0" width="2" height="26" fill="#000000"/>
      <rect x="167" y="0" width="3" height="26" fill="#000000"/>
      <rect x="173" y="0" width="6" height="26" fill="#000000"/>
      <rect x="182" y="0" width="2" height="26" fill="#000000"/>
      <rect x="187" y="0" width="4" height="26" fill="#000000"/>
      <rect x="194" y="0" width="2" height="26" fill="#000000"/>
      <rect x="199" y="0" width="5" height="26" fill="#000000"/>
      <rect x="207" y="0" width="3" height="26" fill="#000000"/>
      <text x="110" y="36" text-anchor="middle" font-family="monospace" font-size="9" fill="#333333">${code}</text>
    </svg>
  `;
}

/**
 * Prints 80mm Thermal Receipt (Kassa cheki)
 */
export function printThermalReceipt(receiptData) {
  const {
    id = 'INV-2026-008',
    patient = 'Noma\'lum bemor',
    patientId = 'P-1046',
    doctor = 'Dr. Azimov',
    procedure = 'Kompozit restavratsiya',
    amount = 450000,
    date = '20-Sentabr, 2026 • 19:43',
    method = 'Naqd',
    fiscalNumber = '482910481239',
    fmNumber = '001928374',
    terminalId = 'T-88401',
    cashier = 'Nigora R. (Kassir-1)',
    clinicName = 'DentUz Dental Clinic',
    clinicLegalName = 'MCHJ "DENTUZ MED SERVIS"',
    clinicInn = '308 124 591',
    licenseNumber = 'MED-UZ-2021-9988',
    address = 'Toshkent sh., Chilonzor t., Bunyodkor shoh ko\'chasi 42',
    phone = '+998 (71) 200-44-22'
  } = receiptData;

  const formattedAmount = Number(amount || 0).toLocaleString('uz-UZ') + ' UZS';
  const barcodeSvg = getRawBarcodeSvg(id.replace(/[^A-Za-z0-9]/g, ''));

  const receiptHtml = `
    <!DOCTYPE html>
    <html lang="uz">
    <head>
      <meta charset="utf-8" />
      <title>Kassa Cheki - ${id}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          font-family: 'Courier New', Courier, 'Lucida Console', monospace;
          background: #ffffff;
          color: #000000;
          width: 76mm;
          margin: 0 auto;
          padding: 6mm 4mm 10mm 4mm;
          font-size: 11px;
          line-height: 1.35;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .bold { font-weight: bold; }
        
        .clinic-brand {
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .clinic-sub {
          font-size: 9px;
          line-height: 1.25;
          margin-bottom: 4px;
        }
        
        .divider-solid {
          border-top: 1px solid #000000;
          margin: 6px 0;
        }
        .divider-dashed {
          border-top: 1px dashed #000000;
          margin: 6px 0;
        }
        .divider-double {
          border-top: 2px dashed #000000;
          margin: 8px 0;
        }

        .row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2px;
        }
        .row-item {
          font-size: 10px;
        }
        
        .table-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
          margin-bottom: 4px;
        }
        .table-item-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin-bottom: 3px;
        }
        
        .total-box {
          margin: 6px 0;
          padding: 5px 0;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
        }
        .total-amount {
          font-size: 15px;
          font-weight: 900;
        }

        .fiscal-badge {
          border: 1px solid #000000;
          padding: 4px;
          margin: 6px 0;
          text-align: center;
          font-weight: bold;
          font-size: 9.5px;
          letter-spacing: 0.3px;
        }

        .barcode-section {
          margin: 8px 0 4px 0;
          text-align: center;
        }
        .barcode-section svg {
          margin: 0 auto;
          display: block;
          max-width: 100%;
        }

        .footer-note {
          font-size: 9px;
          line-height: 1.3;
          margin-top: 6px;
          text-align: center;
        }

        @media screen {
          body {
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            margin: 20px auto;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="text-center">
        <div class="clinic-brand">${clinicName}</div>
        <div class="clinic-sub bold">${clinicLegalName}</div>
        <div class="clinic-sub">STIR (INN): ${clinicInn}</div>
        <div class="clinic-sub">Litsenziya: ${licenseNumber}</div>
        <div class="clinic-sub">${address}</div>
        <div class="clinic-sub">Tel: ${phone}</div>
      </div>

      <div class="divider-solid"></div>

      <div class="text-center bold" style="font-size: 12px; margin-bottom: 4px;">
        *** FISKAL TO'LOV CHEKI ***
      </div>
      <div class="row">
        <span class="row-item">Chek №:</span>
        <span class="row-item bold">${id}</span>
      </div>
      <div class="row">
        <span class="row-item">Sana va vaqt:</span>
        <span class="row-item">${date}</span>
      </div>
      <div class="row">
        <span class="row-item">Kassir / Kassa:</span>
        <span class="row-item">${cashier}</span>
      </div>
      <div class="row">
        <span class="row-item">POS-Terminal ID:</span>
        <span class="row-item">${terminalId}</span>
      </div>

      <div class="divider-dashed"></div>

      <div class="row">
        <span class="row-item">Bemor:</span>
        <span class="row-item bold">${patient}</span>
      </div>
      <div class="row">
        <span class="row-item">Bemor Karta ID:</span>
        <span class="row-item">${patientId}</span>
      </div>
      <div class="row">
        <span class="row-item">Shifokor:</span>
        <span class="row-item">${doctor}</span>
      </div>

      <div class="divider-dashed"></div>

      <div class="table-header">
        <span>Xizmat / MXIK</span>
        <span>Summa</span>
      </div>
      <div class="table-item-row bold">
        <span>1. ${procedure}</span>
        <span>${formattedAmount}</span>
      </div>
      <div class="row" style="font-size: 9px; color: #444; margin-bottom: 4px;">
        <span>MXIK: 08621001001000000 (Stomatologiya)</span>
        <span>1 x ${formattedAmount}</span>
      </div>

      <div class="total-box">
        <div class="row">
          <span style="font-size: 12px; font-weight: bold;">JAMI TO'LOV:</span>
          <span class="total-amount">${formattedAmount}</span>
        </div>
        <div class="row" style="font-size: 10px; margin-top: 4px;">
          <span>To'lov usuli:</span>
          <span class="bold">${method.toUpperCase()}</span>
        </div>
        <div class="row" style="font-size: 9px;">
          <span>QQS stavkasi (0% tibbiy imtiyoz):</span>
          <span>0.00 UZS</span>
        </div>
      </div>

      <div class="fiscal-badge">
        ✓ SOLIQ VA FISKAL OPERATOR TIZIMIDA QAYD ETILDI
      </div>

      <div class="row" style="font-size: 9px;">
        <span>ФМ (Fiskal Modul №):</span>
        <span class="bold">${fmNumber}</span>
      </div>
      <div class="row" style="font-size: 9px;">
        <span>ФП (Fiskal Belgi):</span>
        <span class="bold">${fiscalNumber}</span>
      </div>
      <div class="row" style="font-size: 9px;">
        <span>Holati:</span>
        <span class="bold">MUVAFFAQIN YAKUNLANDI</span>
      </div>

      <div class="barcode-section">
        ${barcodeSvg}
      </div>

      <div class="divider-double"></div>

      <div class="footer-note">
        Tashrifingiz va ishonchingiz uchun rahmat!<br />
        Klinikamiz sizga sog'lom tabassum tilaydi.<br />
        <strong>DentUz Dental OS • v2.4</strong>
      </div>
      <div class="text-center" style="font-size: 8px; margin-top: 4px; letter-spacing: 2px;">
        - - - - - - - - - - - - - - - - - -
      </div>
    </body>
    </html>
  `;

  executePrint(receiptHtml);
}

/**
 * Prints A4 / A5 Official Medical Invoice & Receipt (Rasmiy blanka)
 */
export function printOfficialInvoiceA4(receiptData) {
  const {
    id = 'INV-2026-008',
    patient = 'Noma\'lum bemor',
    patientId = 'P-1046',
    doctor = 'Dr. Azimov',
    procedure = 'Kompozit restavratsiya',
    amount = 450000,
    date = '20-Sentabr, 2026 • 19:43',
    method = 'Naqd',
    fiscalNumber = '482910481239',
    fmNumber = '001928374',
    cashier = 'Nigora R. (Kassir-1)',
    clinicName = 'DentUz Stomatologiya Klinikasi',
    clinicLegalName = 'MCHJ "DENTUZ MED SERVIS"',
    clinicInn = '308 124 591',
    licenseNumber = 'MED-UZ-2021-9988',
    address = 'Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko\'chasi 42-uy',
    phone = '+998 (71) 200-44-22'
  } = receiptData;

  const formattedAmount = Number(amount || 0).toLocaleString('uz-UZ') + ' UZS';

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="uz">
    <head>
      <meta charset="utf-8" />
      <title>Rasmiy To'lov Kvitansiyasi - ${id}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm 15mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          background: #ffffff;
          padding: 10px;
          font-size: 11pt;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #0891b2;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .brand-title {
          font-size: 20pt;
          font-weight: 800;
          color: #0891b2;
          text-transform: uppercase;
        }
        .brand-legal {
          font-size: 9pt;
          color: #475569;
          margin-top: 3px;
        }
        .invoice-title-block {
          text-align: right;
        }
        .invoice-main-title {
          font-size: 14pt;
          font-weight: 800;
          color: #0f172a;
        }
        .invoice-badge {
          display: inline-block;
          background: #e0f2fe;
          color: #0369a1;
          font-weight: bold;
          font-size: 10pt;
          padding: 3px 10px;
          border-radius: 4px;
          margin-top: 4px;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 18px;
        }
        .meta-col h4 {
          font-size: 9pt;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          margin-bottom: 6px;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 3px;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 10pt;
          margin-bottom: 4px;
        }
        .meta-lbl { color: #64748b; }
        .meta-val { font-weight: 600; color: #0f172a; }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th {
          background: #0891b2;
          color: #ffffff;
          font-weight: 700;
          font-size: 10pt;
          padding: 10px 12px;
          text-align: left;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 10pt;
        }

        .summary-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: 10px;
          gap: 30px;
        }
        .fiscal-info-card {
          flex: 1;
          border: 1px dashed #0891b2;
          background: #f0fdfa;
          padding: 14px 18px;
          border-radius: 8px;
        }
        .total-summary-card {
          width: 280px;
        }
        .total-summary-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 10pt;
        }
        .total-highlight {
          border-top: 2px solid #0f172a;
          font-size: 14pt;
          font-weight: 800;
          color: #0891b2;
          padding-top: 8px;
          margin-top: 4px;
        }

        .signatures-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          margin-top: 45px;
          padding-top: 20px;
        }
        .sig-block {
          border-top: 1px solid #94a3b8;
          padding-top: 8px;
          font-size: 10pt;
        }
        .sig-role { font-weight: bold; color: #0f172a; }
        .sig-sub { font-size: 9pt; color: #64748b; margin-top: 2px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand-title">🏥 ${clinicName}</div>
          <div class="brand-legal"><strong>Yuridik shaxs:</strong> ${clinicLegalName}</div>
          <div class="brand-legal"><strong>STIR (INN):</strong> ${clinicInn} &bull; <strong>Litsenziya:</strong> ${licenseNumber}</div>
          <div class="brand-legal"><strong>Manzil:</strong> ${address}</div>
          <div class="brand-legal"><strong>Murojaat uchun tel:</strong> ${phone}</div>
        </div>
        <div class="invoice-title-block">
          <div class="invoice-main-title">TO'LOV KVITANSIYASI</div>
          <div class="invoice-badge">${id}</div>
          <div style="font-size: 9pt; color: #64748b; margin-top: 6px;">Sana: ${date}</div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-col">
          <h4>Bemor Rekvizitlari</h4>
          <div class="meta-row"><span class="meta-lbl">F.I.Sh.:</span><span class="meta-val">${patient}</span></div>
          <div class="meta-row"><span class="meta-lbl">Tibbiy karta raqami:</span><span class="meta-val">${patientId}</span></div>
          <div class="meta-row"><span class="meta-lbl">Davolovchi shifokor:</span><span class="meta-val">${doctor}</span></div>
        </div>
        <div class="meta-col">
          <h4>Hisob-kitob Parametrlari</h4>
          <div class="meta-row"><span class="meta-lbl">To'lov usuli:</span><span class="meta-val">${method.toUpperCase()}</span></div>
          <div class="meta-row"><span class="meta-lbl">Mas'ul kassir:</span><span class="meta-val">${cashier}</span></div>
          <div class="meta-row"><span class="meta-lbl">Fiskal holati:</span><span class="meta-val" style="color: #059669;">Tasdiqlangan va to'langan</span></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">№</th>
            <th>Ko'rsatilgan stomatologik xizmat / Muolaja nomi</th>
            <th style="width: 140px;">MXIK Kodi</th>
            <th style="width: 70px; text-align: center;">Miqdori</th>
            <th style="width: 130px; text-align: right;">Summa</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; font-weight: bold;">1</td>
            <td><strong>${procedure}</strong><br/><span style="font-size: 8.5pt; color: #64748b;">Sanitariya va tibbiy protokol asosida to'liq restavratsiya</span></td>
            <td style="font-family: monospace; font-size: 9pt;">08621001001000000</td>
            <td style="text-align: center;">1 muolaja</td>
            <td style="text-align: right; font-weight: bold;">${formattedAmount}</td>
          </tr>
        </tbody>
      </table>

      <div class="summary-wrapper">
        <div class="fiscal-info-card">
          <div style="font-size: 9.5pt; line-height: 1.45;">
            <div style="font-weight: bold; color: #0f766e; margin-bottom: 4px;">✓ SOLIQ QO'MITASI FISKAL TIZIMIDA QAYD ETILGAN</div>
            <div><strong>ФМ (Fiskal modul):</strong> ${fmNumber}</div>
            <div><strong>ФП (Fiskal belgi):</strong> ${fiscalNumber}</div>
            <div style="color: #64748b; font-size: 8.5pt; margin-top: 5px;">Ushbu chek soliq va sug'urta kompensatsiyalari uchun rasmiy asos bo'ladi.</div>
          </div>
        </div>

        <div class="total-summary-card">
          <div class="total-summary-row">
            <span style="color: #64748b;">Xizmatlar summasi:</span>
            <span>${formattedAmount}</span>
          </div>
          <div class="total-summary-row">
            <span style="color: #64748b;">QQS (0% imtiyoz):</span>
            <span>0.00 UZS</span>
          </div>
          <div class="total-summary-row total-highlight">
            <span>JAMI TO'LOV:</span>
            <span>${formattedAmount}</span>
          </div>
        </div>
      </div>

      <div class="signatures-grid">
        <div class="sig-block">
          <div class="sig-role">Kassir / Hisobchi:</div>
          <div class="sig-sub">${cashier} (Imzo: _________________)</div>
          <div style="margin-top: 14px; font-size: 8.5pt; color: #94a3b8;">M.O'. (Klinika muhri o'rni)</div>
        </div>
        <div class="sig-block">
          <div class="sig-role">Bemor (To'lovchi):</div>
          <div class="sig-sub">${patient} (Imzo: _________________)</div>
          <div style="margin-top: 14px; font-size: 8.5pt; color: #94a3b8;">Xizmat va hisob-kitob bo'yicha e'tirozlarim yo'q.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  executePrint(invoiceHtml);
}

function executePrint(htmlContent) {
  try {
    const printWindow = window.open('', '_blank', 'width=750,height=850');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
      return;
    }
  } catch (e) {
    console.warn('Popup blocked, falling back to iframe', e);
  }

  // Fallback: Invisible iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  document.body.appendChild(iframe);

  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(htmlContent);
  iframe.contentWindow.document.close();
  iframe.contentWindow.focus();

  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);
  }, 400);
}
