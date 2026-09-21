'use strict';

const router = require('express').Router();
const ctrl = require('../controller/appointmentsController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { body } = require('express-validator');

const createRules = [
  body('patientId').notEmpty(),
  body('date').isDate().withMessage('Sana noto\'g\'ri'),
  body('time').matches(/^\d{2}:\d{2}$/).withMessage('Vaqt HH:MM formatida bo\'lishi kerak'),
];

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/today', ctrl.getToday);
router.post('/', createRules, validate, ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
