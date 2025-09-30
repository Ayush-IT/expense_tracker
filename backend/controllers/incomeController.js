
const xlsx = require('xlsx');
const Income = require('../models/Income');


const { computeNextRun } = require('../utils/recurrence');

exports.addIncome = async (req, res) => {
    const userId = req.user._id;

    try {
        const { icon, source, amount, date, isRecurring = false, recurrenceType = 'none', customIntervalDays = null, recurUntil = null } = req.body;

        if(!source || !amount || !date) {
            return res.status(400).json({
                success: false,
                message: 'all fields are required'
            });
        }

        const nextRun = (isRecurring && recurrenceType !== 'none') ? computeNextRun(date || new Date(), recurrenceType, customIntervalDays) : null;

        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date: new Date(date),
            isRecurring: Boolean(isRecurring),
            recurrenceType,
            customIntervalDays,
            nextRunAt: nextRun,
            recurUntil
        });

        await newIncome.save();

        res.status(200).json(newIncome);
    }catch (error){
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
     })
 }
};

exports.getAllIncomes = async (req, res) => {
    const userId = req.user._id;    

    try {
        const incomes = await Income.find({ userId }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: incomes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    } 
};

exports.deleteIncome = async (req, res) => {
    const userId = req.user._id;
    const incomeId = req.params.id;

    try {
        const income = await Income.findOneAndDelete({ _id: incomeId, userId });
        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'Income not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Income deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}; 

// Update an existing income
exports.updateIncome = async (req, res) => {
    const userId = req.user._id;
    const incomeId = req.params.id;

    try {
        const { icon, source, amount, date, isRecurring, recurrenceType, customIntervalDays, recurUntil } = req.body;

        // Build update object only with provided fields
        const update = {};
        if (icon !== undefined) update.icon = icon;
        if (source !== undefined) update.source = source;
        if (amount !== undefined) update.amount = amount;
        if (date !== undefined) update.date = new Date(date);

        // Recurring logic
        const hasRecurringFields = (
            isRecurring !== undefined ||
            recurrenceType !== undefined ||
            customIntervalDays !== undefined ||
            recurUntil !== undefined
        );

        if (hasRecurringFields) {
            const toggleOn = Boolean(isRecurring) && recurrenceType && recurrenceType !== 'none';

            if (toggleOn) {
                update.isRecurring = true;
                update.recurrenceType = recurrenceType;
                update.customIntervalDays = recurrenceType === 'custom' ? (customIntervalDays ?? null) : null;
                update.recurUntil = recurUntil ?? null;

                const baseDate = date ? new Date(date) : undefined;
                const existing = await Income.findOne({ _id: incomeId, userId }, { date: 1, recurrenceType: 1, customIntervalDays: 1 });
                const base = baseDate || existing?.date || new Date();
                const { computeNextRun } = require('../utils/recurrence');
                update.nextRunAt = computeNextRun(base, recurrenceType, update.customIntervalDays);
            } else {
                if (isRecurring === false || recurrenceType === 'none') {
                    update.isRecurring = false;
                    update.recurrenceType = 'none';
                    update.customIntervalDays = null;
                    update.nextRunAt = null;
                    update.recurUntil = null;
                }
            }
        } else if (date !== undefined) {
            const existing = await Income.findOne({ _id: incomeId, userId }, { isRecurring: 1, recurrenceType: 1, customIntervalDays: 1 });
            if (existing?.isRecurring && existing?.recurrenceType && existing.recurrenceType !== 'none') {
                const { computeNextRun } = require('../utils/recurrence');
                update.nextRunAt = computeNextRun(new Date(date), existing.recurrenceType, existing.customIntervalDays);
            }
        }

        if (Object.keys(update).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields provided to update'
            });
        }

        const income = await Income.findOneAndUpdate(
            { _id: incomeId, userId },
            { $set: update },
            { new: true }
        );

        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'Income not found'
            });
        }

        res.status(200).json({
            success: true,
            data: income
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user._id;

    try {
        const income = await Income.find({ userId }).sort({ date: -1 });

        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date.toISOString().split('T')[0],
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, 'Income');
        xlsx.writeFile(wb, 'income_details.xlsx');
        res.download('income_details.xlsx');
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};