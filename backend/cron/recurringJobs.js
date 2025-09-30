const cron = require('node-cron');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const { computeNextRun } = require('../utils/recurrence');

async function processModel(Model, typeLabel) {
  const now = new Date();
  const docs = await Model.find({
    isRecurring: true,
    recurrenceType: { $ne: 'none' },
    nextRunAt: { $ne: null, $lte: now },
  }).limit(500);

  for (const doc of docs) {
    // Stop if recurUntil is set and nextRunAt is beyond it
    if (doc.recurUntil && doc.nextRunAt > doc.recurUntil) {
      // Disable further runs
      doc.isRecurring = false;
      doc.recurrenceType = 'none';
      doc.nextRunAt = null;
      await doc.save();
      continue;
    }

    // Create a new transaction cloned from template fields
    const payload = doc.toObject();
    delete payload._id;
    payload.date = doc.nextRunAt; // set date to due time
    payload.lastGeneratedAt = null;
    payload.nextRunAt = null;

    const created = await Model.create(payload);

    // Update template's lastGeneratedAt and nextRunAt
    doc.lastGeneratedAt = new Date();
    const next = computeNextRun(doc.nextRunAt, doc.recurrenceType, doc.customIntervalDays);
    doc.nextRunAt = next;
    await doc.save();

    // Optional: log
    // eslint-disable-next-line no-console
    console.log(`[recurring] Created ${typeLabel} ${created._id} for template ${doc._id}`);
  }
}

function initRecurringJobs() {
  // Schedule: env override -> dev every minute -> prod daily at 00:05
  const scheduleExpr = process.env.RECURRING_CRON || (process.env.NODE_ENV === 'development' ? '* * * * *' : '5 0 * * *');

  cron.schedule(scheduleExpr, async () => {
    try {
      await processModel(Expense, 'expense');
      await processModel(Income, 'income');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[recurring] job failed', err);
    }
  });

  console.log(`[recurring] Scheduler initialized with cron: ${scheduleExpr}`);
}

module.exports = { initRecurringJobs };
