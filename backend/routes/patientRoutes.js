'use strict';

const router = require('express').Router();
const ctrl = require('../controller/patientsController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { body, param } = require('express-validator');

const createRules = [
  body('name').notEmpty().withMessage('Ism talab etiladi'),
  body('phone').optional().isMobilePhone(),
];

router.use(authenticate);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     tags: [Patients]
 *     summary: Paginated patient list with search and filter
 */
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', createRules, validate, ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', authorize('owner', 'doctor'), ctrl.remove);

module.exports = router;
