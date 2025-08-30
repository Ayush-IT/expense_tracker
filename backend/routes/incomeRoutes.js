const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const{
    addIncome,
    getAllIncomes,
    deleteIncome,
    downloadIncomeExcel,
    updateIncome
} = require('../controllers/incomeController');

const router = express.Router();

router.post('/add', protect, addIncome);

router.get('/get', protect, getAllIncomes);

router.get('/downloadexcel', protect, downloadIncomeExcel);

router.delete('/:id', protect, deleteIncome);

router.put('/:id', protect, updateIncome);

module.exports = router;