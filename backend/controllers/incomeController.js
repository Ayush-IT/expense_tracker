
const xlsx = require('xlsx');
const Income = require('../models/Income');


exports.addIncome = async (req, res) => {
    const userId = req.user._id;

    try {
        const { icon, source, amount, date } = req.body;

        if(!source || !amount || !date) {
            return res.status(400).json({
                success: false,
                message: 'all fields are required'
            });
        }

        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date: new Date(date)
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
        const { icon, source, amount, date } = req.body;

        // Build update object only with provided fields
        const update = {};
        if (icon !== undefined) update.icon = icon;
        if (source !== undefined) update.source = source;
        if (amount !== undefined) update.amount = amount;
        if (date !== undefined) update.date = new Date(date);

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