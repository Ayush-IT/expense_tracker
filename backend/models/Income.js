const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    icon: {
        type: String},
    source: {
        type: String, required: true}, 
    amount: {
        type: Number, required: true},
    date: {
        type: Date, default: Date.now},
    // Recurring fields
    isRecurring: { type: Boolean, default: false },
    recurrenceType: { type: String, enum: ['none', 'weekly', 'monthly', 'custom'], default: 'none' },
    customIntervalDays: { type: Number, default: null },
    lastGeneratedAt: { type: Date, default: null },
    nextRunAt: { type: Date, default: null },
    recurUntil: { type: Date, default: null }
}, {
    timestamps: true});

module.exports = mongoose.model('Income', IncomeSchema);