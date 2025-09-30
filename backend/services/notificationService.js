const nodemailer = require('nodemailer');

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    FROM_EMAIL,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
    // eslint-disable-next-line no-console
    console.warn('[notify] SMTP env incomplete; emails will be logged only');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

// Timezone helpers (align with cron job defaults)
function getTimezoneForBillEmail(user, bill) {
  return bill.timezone || user?.timezone || 'Asia/Kolkata';
}

function formatDateTimeInTz(date, timeZone) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  } catch {
    return new Date(date).toLocaleString();
  }
}

function formatDateInTz(date, timeZone) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(date));
  } catch {
    return new Date(date).toLocaleDateString();
  }
}

function renderBillReminderSubject({ bill, daysUntil, timeZone }) {
  if (daysUntil > 1) return `Reminder: ${bill.title} due in ${daysUntil} days`;
  if (daysUntil === 1) return `Reminder: ${bill.title} due tomorrow`;
  if (daysUntil === 0) return `Reminder: ${bill.title} due today`;
  return `Overdue: ${bill.title} was due on ${formatDateInTz(bill.dueDate, timeZone)}`;
}

function renderBillReminderHtml({ user, bill, daysUntil, appBaseUrl, timeZone }) {
  const due = formatDateTimeInTz(bill.dueDate, timeZone);
  const status = bill.status;
  const manageUrl = appBaseUrl ? `${appBaseUrl}/bills/${bill._id}` : '';
  return `
    <div>
      <p>Hi ${user.fullName || user.email},</p>
      <p>This is a reminder for your bill <strong>${bill.title}</strong> (${bill.vendor || '—'})</p>
      <ul>
        <li>Amount: <strong>${bill.amount}</strong></li>
        <li>Due: <strong>${due}</strong> <span style="color:#666">(${timeZone})</span></li>
        <li>Status: <strong>${status}</strong></li>
      </ul>
      ${manageUrl ? `<p>Manage: <a href="${manageUrl}">${manageUrl}</a></p>` : ''}
      <p style="color:#666;font-size:12px;">You received this because bill reminders are enabled. Update your timezone in Profile for accurate local times.</p>
      <p>— Expense Tracker</p>
    </div>
  `;
}

async function sendBillReminderEmail(user, bill, { daysUntil }) {
  const timeZone = getTimezoneForBillEmail(user, bill);
  const subject = renderBillReminderSubject({ bill, daysUntil, timeZone });
  const html = renderBillReminderHtml({ user, bill, daysUntil, appBaseUrl: process.env.APP_BASE_URL, timeZone });
  const from = process.env.FROM_EMAIL || 'no-reply@example.com';

  if (!user?.email) {
    // eslint-disable-next-line no-console
    console.warn('[notify] user has no email; skipping', { userId: user?._id });
    return { delivered: false, reason: 'no_email' };
  }

  const tx = getTransporter();
  if (!tx) {
    // fallback: log only
    // eslint-disable-next-line no-console
    console.log(`[notify] (LOG ONLY) to=${user.email} subject="${subject}" bill=${bill._id} tz=${timeZone}`);
    return { delivered: false, reason: 'no_smtp' };
  }

  await tx.sendMail({
    from,
    to: user.email,
    subject,
    html,
  });
  return { delivered: true };
}

module.exports = { sendBillReminderEmail };
