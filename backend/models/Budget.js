const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, required: true }, // Use a specific category string; you can use 'ALL' for overall budget
    month: { type: Number, required: true, min: 1, max: 12, index: true },
    year: { type: Number, required: true, min: 1970, index: true },
    amount: { type: Number, required: true, min: 0 },
    thresholdPercent: { type: Number, default: 80, min: 1, max: 100 },
    lastAlertStatus: { type: String, enum: ['none', 'near', 'exceeded'], default: 'none' },
    lastAlertAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Ensure one budget per user/category/month/year
BudgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
