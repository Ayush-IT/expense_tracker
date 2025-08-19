const { Types } = require('mongoose');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail');

// Helper to get month range
function getMonthRange(year, month) {
  // month is 1-12
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0)); // exclusive
  return { start, end };
}

async function computeSpent({ userId, category, month, year }) {
  const { start, end } = getMonthRange(year, month);
  const match = {
    userId: new Types.ObjectId(String(userId)),
    date: { $gte: start, $lt: end },
  };
  if (category && category !== 'ALL') {
    match.category = category;
  }
  const result = await Expense.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
}

async function maybeSendBudgetAlert({ budget, spent, user }) {
  const ratio = budget.amount > 0 ? spent / budget.amount : 0;
  let nextStatus = 'none';
  if (ratio >= 1) nextStatus = 'exceeded';
  else if (ratio >= budget.thresholdPercent / 100) nextStatus = 'near';

  if (nextStatus === 'none' || nextStatus === budget.lastAlertStatus) return; // no change

  // Build and send a minimal email
  const subject =
    nextStatus === 'exceeded'
      ? `Budget exceeded: ${budget.category} ${budget.month}/${budget.year}`
      : `Budget nearing limit: ${budget.category} ${budget.month}/${budget.year}`;
  const percent = Math.round((spent / budget.amount) * 100);
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <h3>${subject}</h3>
      <p>Hi ${user.fullName || 'there'},</p>
      <p>Your budget for <b>${budget.category}</b> (${budget.month}/${budget.year}) is <b>${percent}%</b> utilized.</p>
      <ul>
        <li>Budget: <b>${budget.amount.toFixed(2)}</b></li>
        <li>Spent: <b>${spent.toFixed(2)}</b></li>
        <li>Threshold: <b>${budget.thresholdPercent}%</b></li>
      </ul>
      <p>— Expense Tracker</p>
    </div>`;

  try {
    await sendEmail({ to: user.email, subject, html });
    budget.lastAlertStatus = nextStatus;
    budget.lastAlertAt = new Date();
    await budget.save();
  } catch (e) {
    // Do not block the request on email failure
    console.error('Failed to send budget alert email:', e.message);
  }
}

exports.createBudget = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category = 'ALL', month, year, amount, thresholdPercent = 80 } = req.body;

    if (!month || !year || !amount) {
      return res.status(400).json({ success: false, message: 'month, year, amount are required' });
    }

    const budget = await Budget.create({
      userId,
      category,
      month,
      year,
      amount,
      thresholdPercent,
    });

    // Compute progress and maybe send alert immediately
    const spent = await computeSpent({ userId, category, month, year });
    const progressPercent = budget.amount > 0 ? Math.min(100, Math.round((spent / budget.amount) * 100)) : 0;

    const user = req.user || (await User.findById(userId));
    await maybeSendBudgetAlert({ budget, spent, user });

    return res.status(201).json({
      success: true,
      data: {
        ...budget.toObject(),
        spent,
        progressPercent,
        remaining: Math.max(0, budget.amount - spent),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Budget already exists for this category and month' });
    }
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getBudgets = async (req, res) => {
  try {
    const userId = req.user._id;
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'month and year are required' });
    }

    const budgets = await Budget.find({ userId, month, year }).sort({ category: 1 });

    const user = req.user || (await User.findById(userId));

    const results = [];
    for (const b of budgets) {
      const spent = await computeSpent({ userId, category: b.category, month, year });
      const progressPercent = b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
      // Fire-and-forget alert evaluation (do not await)
      maybeSendBudgetAlert({ budget: b, spent, user }).catch(() => {});
      results.push({
        ...b.toObject(),
        spent,
        progressPercent,
        remaining: Math.max(0, b.amount - spent),
      });
    }

    return res.json({ success: true, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { amount, thresholdPercent } = req.body;

    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (typeof amount !== 'undefined') budget.amount = amount;
    if (typeof thresholdPercent !== 'undefined') budget.thresholdPercent = thresholdPercent;

    await budget.save();

    const spent = await computeSpent({ userId, category: budget.category, month: budget.month, year: budget.year });
    const progressPercent = budget.amount > 0 ? Math.min(100, Math.round((spent / budget.amount) * 100)) : 0;

    const user = req.user || (await User.findById(userId));
    await maybeSendBudgetAlert({ budget, spent, user });

    return res.json({
      success: true,
      data: {
        ...budget.toObject(),
        spent,
        progressPercent,
        remaining: Math.max(0, budget.amount - spent),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const deleted = await Budget.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    return res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
