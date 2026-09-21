'use strict';

const router = require('express').Router();
const ctrl = require('../controller/teamController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { body } = require('express-validator');

router.use(authenticate);

router.get('/', ctrl.getTeam);
router.post(
  '/',
  authorize('owner', 'receptionist'),
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['owner', 'doctor', 'receptionist', 'nurse']),
  ],
  validate,
  ctrl.addMember
);
router.put('/:id', authorize('owner', 'receptionist'), ctrl.updateMember);
router.delete('/:id', authorize('owner'), ctrl.removeMember);

module.exports = router;
