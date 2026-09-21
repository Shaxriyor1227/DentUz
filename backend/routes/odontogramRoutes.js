'use strict';

const router = require('express').Router();
const ctrl = require('../controller/odontogramController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/:patientId', ctrl.getByPatient);
router.put('/:patientId', ctrl.save);
router.get('/:patientId/history', ctrl.getHistory);

module.exports = router;
