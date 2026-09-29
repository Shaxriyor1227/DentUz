const { sequelize, Invoice, Payment } = require('../models');

const isExecute = process.argv.includes('--execute');

const runBackfill = async () => {
  console.log('======================================================================');
  console.log(`🧾 INVOICE PAID_AMOUNT BACKFILL & RECONCILE (${isExecute ? 'EXECUTE REJIMI' : 'DRY-RUN REJIMI'})`);
  console.log('======================================================================\n');

  try {
    await sequelize.authenticate();

    const invoices = await Invoice.findAll({ order: [['createdAt', 'ASC']] });
    const payments = await Payment.findAll({ raw: true });

    // Group payments by invoiceId
    const paymentsByInvoice = {};
    payments.forEach((p) => {
      if (p.invoiceId) {
        paymentsByInvoice[p.invoiceId] = (paymentsByInvoice[p.invoiceId] || 0) + Number(p.amount);
      }
    });

    const diffRows = [];
    const reconcileWarnings = [];

    for (const inv of invoices) {
      const invTotal = Number(inv.amount || 0);
      const currentPaid = Number(inv.paidAmount || 0);
      const paymentsSum = paymentsByInvoice[inv.id] || 0;

      // Calculate reconciled status
      let calculatedStatus = inv.status;
      if (paymentsSum >= invTotal && invTotal > 0) {
        calculatedStatus = 'paid';
      } else if (paymentsSum > 0 && paymentsSum < invTotal) {
        calculatedStatus = 'partial';
      } else if (paymentsSum === 0) {
        // If there are no payment rows, but status was marked paid (legacy seed), flag it
        if (inv.status === 'paid' && invTotal > 0) {
          reconcileWarnings.push({
            invoiceId: inv.id,
            clinicId: inv.clinicId,
            issue: `Invoys statusi 'paid' (${invTotal} UZS), lekin unga tegishli to'lov (Payment) qatori yo'q`,
          });
        }
      }

      const hasDiff = currentPaid !== paymentsSum || (calculatedStatus !== inv.status && paymentsSum > 0);

      if (hasDiff) {
        diffRows.push({
          id: inv.id,
          clinicId: inv.clinicId,
          totalAmount: invTotal,
          oldPaidAmount: currentPaid,
          newPaidAmount: paymentsSum,
          oldStatus: inv.status,
          newStatus: calculatedStatus,
        });

        if (isExecute) {
          await inv.update({
            paidAmount: paymentsSum,
            status: calculatedStatus,
          });
        }
      }
    }

    if (diffRows.length > 0) {
      console.log('📊 FARQ QILGAN INVOYSLAR RO\'YXATI:');
      console.table(diffRows);
    } else {
      console.log('✅ Barcha hisob-fakturalarning paidAmount summasi to\'lovlar bilan to\'liq mos.');
    }

    if (reconcileWarnings.length > 0) {
      console.log('\n⚠️ RECONCILE OGOHLANTIRISHLARI (Payment qatori bo\'lmagan, lekin statusi paid/partial bo\'lgan invoyslar):');
      console.table(reconcileWarnings);
    }

    console.log(`\nJami ko'rib chiqilgan invoyslar: ${invoices.length}`);
    console.log(`Farq aniqlangan invoyslar: ${diffRows.length}`);
    if (!isExecute) {
      console.log('\n💡 Eslatma: Ushbu rejim faqat tahlil (DRY-RUN). Haqiqiy o\'zgartirish kiritish uchun:');
      console.log('   node scripts/backfill_invoice_paid_amount.js --execute');
    } else {
      console.log('\n🎉 O\'zgarishlar muvaffaqiyatli saqlandi!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Backfill xatosi:', err);
    process.exit(1);
  }
};

runBackfill();
