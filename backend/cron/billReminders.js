const cron = require('node-cron');
const Bill = require('../models/Bill');
const User = require('../models/User');
const { sendBillReminderEmail } = require('../services/notificationService');
// Note: Avoid ESM/CJS interop issues by using Intl for timezone handling

// Helper: zero out time for date-only compare in UTC
function toUTCDateOnly(d) {
  const dt = new Date(d);
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
}

function daysBetweenUTC(a, b) {
  const A = toUTCDateOnly(a).getTime();
  const B = toUTCDateOnly(b).getTime();
  const diffMs = A - B;
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

// Timezone helpers (Intl)
function getTimezoneForBill(bill, user) {
  // Prefer bill.timezone, then user.timezone, else UTC
  return bill.timezone || user?.timezone || 'Asia/Kolkata';
}

function getLocalDateKey(date, timeZone) {
  // en-CA gives YYYY-MM-DD
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  return fmt.format(date); // e.g. '2025-09-14'
}

function getLocalHour(date, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone, hour: '2-digit', hour12: false });
  const parts = fmt.formatToParts(date);
  const hourStr = parts.find(p => p.type === 'hour')?.value;
  return hourStr ? Number(hourStr) : null;
}

function ymdToUtcMs(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1);
}

function daysBetweenLocal(dueDate, refDate, timeZone) {
  const dueKey = getLocalDateKey(dueDate, timeZone);
  const refKey = getLocalDateKey(refDate, timeZone);
  const dueMs = ymdToUtcMs(dueKey);
  const refMs = ymdToUtcMs(refKey);
  return Math.round((dueMs - refMs) / (24 * 60 * 60 * 1000));
}

async function updateBillStatuses() {
  const now = new Date();
  const bills = await Bill.find({ status: { $ne: 'paused' } }).limit(2000);
  for (const bill of bills) {
    // Fetch user for timezone resolution
    const user = await User.findById(bill.userId).select('timezone');
    const tz = getTimezoneForBill(bill, user);

    const todayKey = getLocalDateKey(now, tz);
    const dueKey = getLocalDateKey(bill.dueDate, tz);

    let newStatus = bill.status;
    if (dueKey < todayKey) newStatus = 'overdue';
    else if (dueKey === todayKey) newStatus = 'due_today';
    else newStatus = 'upcoming';

    if (newStatus !== bill.status) {
      bill.status = newStatus;
      await bill.save();
      // eslint-disable-next-line no-console
      console.log(`[bill-reminder] status -> ${newStatus} bill=${bill._id} due=${bill.dueDate.toISOString()} tz=${tz}`);
    }
  }
}

async function processReminders() {
  const now = new Date();

  const bills = await Bill.find({
    remindersEnabled: true,
    status: { $in: ['upcoming', 'due_today', 'overdue'] },
  }).limit(2000);

  for (const bill of bills) {
    // Fetch user early to resolve timezone and preferences
    let user = null;
    try {
      user = await User.findById(bill.userId).select('fullName email notificationPrefs timezone');
    } catch (_) { /* ignore */ }

    const tz = getTimezoneForBill(bill, user);
    const nowLocalHour = getLocalHour(now, tz);
    const todayKey = getLocalDateKey(now, tz);

    // Only trigger at the configured local hour, if set
    if (typeof bill.remindAtHourLocal === 'number' && bill.remindAtHourLocal !== nowLocalHour) continue;

    const d = daysBetweenLocal(bill.dueDate, now, tz);

    // If overdue, allow daily ping at reminder hour until paid
    const targets = new Set(bill.remindDaysBefore || []);
    const shouldRemind = d <= 0 || targets.has(d);
    if (!shouldRemind) continue;

    const dateKey = todayKey; // yyyy-MM-dd per local midnight basis
    const alreadySent = (bill.reminderHistory || []).some((r) => r.dateKey === dateKey);
    if (alreadySent) continue;

    bill.reminderHistory = bill.reminderHistory || [];
    bill.reminderHistory.push({ dateKey, sentAt: new Date() });
    // Cap history to last 180 entries to avoid unbounded growth
    if (bill.reminderHistory.length > 180) {
      bill.reminderHistory = bill.reminderHistory.slice(-180);
    }
    bill.lastReminderSentAt = new Date();
    await bill.save();

    // eslint-disable-next-line no-console
    console.log(`[bill-reminder] REMINDER bill=${bill._id} title="${bill.title}" due=${bill.dueDate.toISOString()} status=${bill.status} daysUntil=${d} tz=${tz}`);

    // Send email notification (best-effort)
    try {
      if (user) {
        const emailEnabled = user.notificationPrefs?.emailEnabled !== false; // default true
        if (!emailEnabled) {
          // eslint-disable-next-line no-console
          console.log(`[bill-reminder] email disabled for user=${user._id}, skipping email for bill=${bill._id}`);
        } else {
          await sendBillReminderEmail(user, bill, { daysUntil: d });
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[bill-reminder] notify failed', e.message);
    }
  }
}

function initBillReminderJobs() {
  // Env override -> dev every minute -> hourly at minute 5
  const scheduleExpr = process.env.REMINDER_CRON || (process.env.NODE_ENV === 'development' ? '* * * * *' : '5 * * * *');

  cron.schedule(scheduleExpr, async () => {
    try {
      await updateBillStatuses();
      await processReminders();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[bill-reminder] job failed', err);
    }
  });

  // eslint-disable-next-line no-console
  console.log(`[bill-reminder] Scheduler initialized with cron: ${scheduleExpr}`);
}

module.exports = { initBillReminderJobs };
