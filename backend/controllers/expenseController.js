
const xlsx = require('xlsx');
const Expense = require('../models/Expense');


exports.addExpense = async (req, res) => {
    const userId = req.user._id;

    try {
        const { icon, category, amount, date } = req.body;

        if(!category || !amount || !date) {
            return res.status(400).json({
                success: false,
                message: 'all fields are required'
            });
        }

        const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date)
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