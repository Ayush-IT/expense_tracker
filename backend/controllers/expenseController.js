
const xlsx = require('xlsx');
const Expense = require('../models/Expense');


const { computeNextRun } = require('../utils/recurrence');

exports.addExpense = async (req, res) => {
    const userId = req.user._id;

    try {
        const { icon, category, amount, date, isRecurring = false, recurrenceType = 'none', customIntervalDays = null, recurUntil = null } = req.body;

        if(!category || !amount || !date) {
            return res.status(400).json({
                success: false,
                message: 'all fields are required'
            });
        }

        const nextRun = (isRecurring && recurrenceType !== 'none') ? computeNextRun(date || new Date(), recurrenceType, customIntervalDays) : null;

        const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date),
            isRecurring: Boolean(isRecurring),
            recurrenceType,
            customIntervalDays,
            nextRunAt: nextRun,
            recurUntil
        });

        await newExpense.save();

        res.status(200).json(newExpense);
    }catch (error){
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
    })
 }
};

exports.getAllExpenses = async (req, res) => {
    const userId = req.user._id;    

    try {
        const expenses = await Expense.find({ userId }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: expenses
        }); 
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    } 
};

exports.deleteExpense = async (req, res) => {
    const userId = req.user._id;
    const expenseId = req.params.id;

    try {
        const expense = await Expense.findOneAndDelete({ _id: expenseId, userId });
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}; 

// Update an existing expense
exports.updateExpense = async (req, res) => {
    const userId = req.user._id;
    const expenseId = req.params.id;

    try {
        const { icon, category, amount, date, isRecurring, recurrenceType, customIntervalDays, recurUntil } = req.body;

        const update = {};
        if (icon !== undefined) update.icon = icon;
        if (category !== undefined) update.category = category;
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
            // Normalize toggles
            const toggleOn = Boolean(isRecurring) && recurrenceType && recurrenceType !== 'none';

            if (toggleOn) {
                update.isRecurring = true;
                update.recurrenceType = recurrenceType;
                update.customIntervalDays = recurrenceType === 'custom' ? (customIntervalDays ?? null) : null;
                update.recurUntil = recurUntil ?? null;

                // Recompute nextRunAt based on provided date (or existing one below)
                const baseDate = date ? new Date(date) : undefined;
                const existing = await Expense.findOne({ _id: expenseId, userId }, { date: 1, recurrenceType: 1, customIntervalDays: 1 });
                const base = baseDate || existing?.date || new Date();
                const { computeNextRun } = require('../utils/recurrence');
                update.nextRunAt = computeNextRun(base, recurrenceType, update.customIntervalDays);
            } else {
                // Disable recurrence
                if (isRecurring === false || recurrenceType === 'none') {
                    update.isRecurring = false;
                    update.recurrenceType = 'none';
                    update.customIntervalDays = null;
                    update.nextRunAt = null;
                    update.recurUntil = null;
                }
            }
        } else if (date !== undefined) {
            // If only date changed and recurrence is active, recompute nextRunAt
            const existing = await Expense.findOne({ _id: expenseId, userId }, { isRecurring: 1, recurrenceType: 1, customIntervalDays: 1 });
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

        const expense = await Expense.findOneAndUpdate(
            { _id: expenseId, userId },
            { $set: update },
            { new: true }
        );

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            data: expense
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user._id;

    try {
        const expense = await Expense.find({ userId }).sort({ date: -1 });

        const data = expense.map((item) => ({
            category: item.category,
            Amount: item.amount,
            Date: item.date.toISOString().split('T')[0],
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, 'expense');
        xlsx.writeFile(wb, 'expense_details.xlsx');
        res.download('expense_details.xlsx');

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};