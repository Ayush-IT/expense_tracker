const nodemailer = require('nodemailer');

// Creates a reusable transporter object using SMTP
// Required envs:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// SEND_FROM (e.g., 'Your App <no-reply@yourapp.com>')
// APP_BASE_URL (e.g., 'http://localhost:8000' or client URL for links)
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration missing: set SMTP_HOST, SMTP_USER, SMTP_PASS');
  }

  return nodemailer.createTransport({
    host,
    port,
    auth: { user, pass },
    secure: port === 465,
  });
};

async function sendEmail({ to, subject, html }) {
  const transporter = getTransporter();
  const from = process.env.SEND_FROM || 'no-reply@localhost';

  const info = await transporter.sendMail({ from, to, subject, html });
  return info;
}

function buildVerificationEmail({ name, email, token }) {
 const baseUrl = process.env.APP_BASE_URL || process.env.CLIENT_URL;
  // We will expose verification via backend route: /api/v1/auth/verify-email
  const verifyUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2>Verify your email</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Thanks for registering. Please verify your email by clicking the button below. This link expires in 1 hour.</p>
      <p style="margin:24px 0;">
        <a href="${verifyUrl}" style="background:#4f46e5;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;">Verify Email</a>
      </p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="word-break: break-all;">${verifyUrl}</p>
      <p>— Expense Tracker Team</p>
    </div>
  `;

  return { subject: 'Verify your email', html };
}

function buildPasswordResetEmail({ name, email, token }) {
  const baseUrl = process.env.CLIENT_URL || process.env.APP_BASE_URL;
  // Link to a frontend reset page where the user can submit a new password
  const resetUrl = `${baseUrl.replace(/\/$/, '')}/auth/reset?token=${token}&email=${encodeURIComponent(email)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2>Reset your password</h2>
      <p>Hi ${name || 'there'},</p>
      <p>We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.</p>
      <p style="margin:24px 0;">
        <a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;">Reset Password</a>
      </p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p>— Expense Tracker Team</p>
    </div>
  `;

  return { subject: 'Reset your password', html };
}

module.exports = {
  sendEmail,
  buildVerificationEmail,
  buildPasswordResetEmail,
};
