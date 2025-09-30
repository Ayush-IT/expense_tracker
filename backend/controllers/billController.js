const Bill = require('../models/Bill');
const { computeNextRun } = require('../utils/recurrence');

// Create Bill
exports.createBill = async (req, res) => {
  const userId = req.user._id;
  try {
    const {
      title,
      vendor,
      amount,
      dueDate,
      notes,
      category,
      // recurrence
      isRecurring = false,
      recurrenceType = 'none',
      customIntervalDays = null,
      recurUntil = null,
      // reminders
      remindersEnabled = true,
      remindDaysBefore = [7, 3, 1],
      remindAtHourLocal = 9,
      timezone = 'UTC',
    } = req.body;

    if (!title || !amount || !dueDate) {
      return res.status(400).json({ success: false, message: 'title, amount, dueDate are required' });
    }

    const bill = new Bill({
      userId,
      title,
      vendor,
      amount,
      dueDate: new Date(dueDate),
      notes,
      category,
      isRecurring: Boolean(isRecurring),
      recurrenceType,
      customIntervalDays,
      recurUntil,
      remindersEnabled: Boolean(remindersEnabled),
      remindDaysBefore,
      remindAtHourLocal,
      timezone,
    });

    // Optionally precompute nextRunAt for recurring (not strictly necessary for bills, but useful)
    if (bill.isRecurring && bill.recurrenceType !== 'none') {
      bill.nextRunAt = computeNextRun(bill.dueDate, bill.recurrenceType, bill.customIntervalDays);
    }

    await bill.save();
    return res.status(201).json({ success: true, data: bill });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// List Bills
exports.getBills = async (req, res) => {
  const userId = req.user._id;
  try {
    const { status } = req.query;
    const filter = { userId };
    if (status) filter.status = status;
    const bills = await Bill.find(filter).sort({ dueDate: 1 });
    return res.status(200).json({ success: true, data: bills });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get Bill by id
exports.getBill = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  try {
    const bill = await Bill.findOne({ _id: id, userId });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    return res.status(200).json({ success: true, data: bill });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Update Bill
exports.updateBill = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  try {
    const {
      title, vendor, amount, dueDate, notes, category,
      isRecurring, recurrenceType, customIntervalDays, recurUntil,
      remindersEnabled, remindDaysBefore, remindAtHourLocal, timezone,
      status, // allow status changes (e.g., pause)
    } = req.body;

    const update = {};
    if (title !== undefined) update.title = title;
    if (vendor !== undefined) update.vendor = vendor;
    if (amount !== undefined) update.amount = amount;
    if (dueDate !== undefined) update.dueDate = new Date(dueDate);
    if (notes !== undefined) update.notes = notes;
    if (category !== undefined) update.category = category;
    if (status !== undefined) update.status = status;

    const hasRecurring = (
      isRecurring !== undefined || recurrenceType !== undefined || customIntervalDays !== undefined || recurUntil !== undefined
    );
    if (hasRecurring) {
      const toggleOn = Boolean(isRecurring) && recurrenceType && recurrenceType !== 'none';
      if (toggleOn) {
        update.isRecurring = true;
        update.recurrenceType = recurrenceType;
        update.customIntervalDays = recurrenceType === 'custom' ? (customIntervalDays ?? null) : null;
        update.recurUntil = recurUntil ?? null;

        const baseDate = (dueDate ? new Date(dueDate) : undefined);
        const existing = await Bill.findOne({ _id: id, userId }, { dueDate: 1, recurrenceType: 1, customIntervalDays: 1 });
        const base = baseDate || existing?.dueDate || new Date();
        update.nextRunAt = computeNextRun(base, recurrenceType, update.customIntervalDays);
      } else if (isRecurring === false || recurrenceType === 'none') {
        update.isRecurring = false;
        update.recurrenceType = 'none';
        update.customIntervalDays = null;
        update.nextRunAt = null;
        update.recurUntil = null;
      }
    } else if (dueDate !== undefined) {
      const existing = await Bill.findOne({ _id: id, userId }, { isRecurring: 1, recurrenceType: 1, customIntervalDays: 1 });
      if (existing?.isRecurring && existing.recurrenceType !== 'none') {
        update.nextRunAt = computeNextRun(new Date(dueDate), existing.recurrenceType, existing.customIntervalDays);
      }
    }

    const hasReminder = (
      remindersEnabled !== undefined || remindDaysBefore !== undefined || remindAtHourLocal !== undefined || timezone !== undefined
    );
    if (hasReminder) {
      if (remindersEnabled !== undefined) update.remindersEnabled = Boolean(remindersEnabled);
      if (remindDaysBefore !== undefined) update.remindDaysBefore = remindDaysBefore;
      if (remindAtHourLocal !== undefined) update.remindAtHourLocal = remindAtHourLocal;
      if (timezone !== undefined) update.timezone = timezone;
    }

    const bill = await Bill.findOneAndUpdate({ _id: id, userId }, { $set: update }, { new: true });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    return res.status(200).json({ success: true, data: bill });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Delete Bill
exports.deleteBill = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  try {
    const removed = await Bill.findOneAndDelete({ _id: id, userId });
    if (!removed) return res.status(404).json({ success: false, message: 'Bill not found' });
    return res.status(200).json({ success: true, message: 'Bill deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Pay Bill
exports.payBill = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  try {
    const bill = await Bill.findOne({ _id: id, userId });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    // Mark paid now
    bill.status = 'paid';

    // Advance if recurring
    if (bill.isRecurring && bill.recurrenceType !== 'none') {
      const nextDue = computeNextRun(bill.dueDate, bill.recurrenceType, bill.customIntervalDays);
      bill.dueDate = nextDue;
      bill.status = 'upcoming';
    }

    await bill.save();
    return res.status(200).json({ success: true, data: bill });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Pause/Resume
exports.pauseBill = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  try {
    const bill = await Bill.findOneAndUpdate({ _id: id, userId }, { $set: { status: 'paused' } }, { new: true });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    return res.status(200).json({ success: true, data: bill });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.resumeBill = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  try {
    const bill = await Bill.findOneAndUpdate({ _id: id, userId }, { $set: { status: 'upcoming' } }, { new: true });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    return res.status(200).json({ success: true, data: bill });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
