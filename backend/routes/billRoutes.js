const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const billController = require('../controllers/billController');

// All bill routes are protected
router.post('/', protect, billController.createBill);
router.get('/', protect, billController.getBills);
router.get('/:id', protect, billController.getBill);
router.put('/:id', protect, billController.updateBill);
router.delete('/:id', protect, billController.deleteBill);

router.post('/:id/pay', protect, billController.payBill);
router.post('/:id/pause', protect, billController.pauseBill);
router.post('/:id/resume', protect, billController.resumeBill);

module.exports = router;
