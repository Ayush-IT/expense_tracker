const Income = require('../models/Income');
const Expense = require('../models/Expense');

const { isValidObjectId } = require('mongoose');
const { Types } = require('mongoose');


exports.getDashboardData = async (req, res) => {
    try {
     const userId = req.user._id;
     const userObjectId = new Types.ObjectId(String(userId));
     
     // Fetch total income & expense
        const totalIncome = await Income.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        console.log('Total Income:', { totalIncome, userId: isValidObjectId(userId) });


        const totalExpense = await Expense.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);


        //Get income transactions in the last 60 days

        const last60DaysIncomeTransactions = await Income.find({
            userId,
            date: { $gte: new Date(new Date().setDate(new Date().getDate() - 60)) }
        }).sort({ date: -1 });

        //Get total income for last 60 days

        const incomeLast60Days = last60DaysIncomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);


        //Get expense transactions in the last 30 days
        const last30DaysExpenseTransactions = await Expense.find({
            userId,
            date: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
        }).sort({ date: -1 });

        //Get total expense for last 30 days
        const expenseLast30Days = last30DaysExpenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);



        //Fetch last 5 transactions (income + expense)
        const lastTransactions = [
            ...(await Income.find({ userId }).sort({ date: -1 }).limit(5)).map(tnx => ({
                ...tnx.toObject(),
                type: 'income'  
            })),
            ...(await Expense.find({ userId }).sort({ date: -1 }).limit(5)).map(tnx => ({
                ...tnx.toObject(), 
                type: 'expense'
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));


        //Final response
        res.json({
            totalBalance:
            (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
            totalIncome: totalIncome[0]?.total || 0,
            totalExpense: totalExpense[0]?.total || 0,
            last30DaysExpenses: {
                total: expenseLast30Days,
                transactions: last30DaysExpenseTransactions,
            },
            last60DaysIncome: {
                total: incomeLast60Days,
                transactions: last60DaysIncomeTransactions
            },
             recentTransactions: lastTransactions,
            });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}