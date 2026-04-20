const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createExpense,
  getExpensesByGroup,
  updateExpense,
  deleteExpense,
  settleExpense
} = require('../controllers/expense.controller');

router.post('/', protect, createExpense);
router.get('/group/:groupId', protect, getExpensesByGroup);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);
router.put('/:id/settle', protect, settleExpense);

module.exports = router;