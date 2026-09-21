'use strict';

const router = require('express').Router();
const ctrl = require('../controller/financeController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { body } = require('express-validator');

router.use(authenticate);

router.get('/stats', ctrl.getStats);
router.get('/invoices', ctrl.getInvoices);
router.post('/invoices', [body('amount').isNumeric(), body('patientId').notEmpty()], validate, ctrl.createInvoice);
router.patch('/invoices/:id/status', [body('status').isIn(['paid', 'pending', 'partial', 'cancelled'])], validate, ctrl.updateStatus);

module.exports = router;
