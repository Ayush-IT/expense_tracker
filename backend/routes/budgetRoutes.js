const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createBudget, getBudgets, updateBudget, deleteBudget } = require('../controllers/budgetController');

const router = express.Router();

// POST /api/v1/budgets
router.post('/', protect, createBudget);

// GET /api/v1/budgets?month=8&year=2025
router.get('/', protect, getBudgets);

// PUT /api/v1/budgets/:id
router.put('/:id', protect, updateBudget);

// DELETE /api/v1/budgets/:id
router.delete('/:id', protect, deleteBudget);

module.exports = router;
