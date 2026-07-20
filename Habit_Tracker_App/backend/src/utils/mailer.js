// Mailer — Week 5 forgot-password flow
// Sends the 6-digit reset code by email using SMTP credentials from .env.
//
// If SMTP_* isn't configured (e.g. a fresh clone before anyone has set up
// an email account for the app), we don't want the whole reset flow to be
// unusable — so we fall back to printing the code to the server console.
// That keeps the feature testable locally out of the box. Fill in real
// SMTP_* values in backend/.env to actually deliver email.

const nodemailer = require('nodemailer');

function isMailerConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter = null;
function getTransporter() {
  if (!isMailerConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587/others
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Emails a 6-digit password reset code to `to`. Falls back to logging the
 * code to the server console if SMTP isn't configured, so the flow still
 * works end-to-end in local dev without requiring real email credentials.
 */
async function sendResetCodeEmail(to, code) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@habitra.app';

  const mailer = getTransporter();
  if (!mailer) {
    console.log('\n──────────────────────────────────────────────');
    console.log(' SMTP is not configured (see backend/.env).');
    console.log(` Password reset code for ${to}: ${code}`);
    console.log(' This code expires in 10 minutes.');
    console.log('──────────────────────────────────────────────\n');
    return { delivered: false };
  }

  await mailer.sendMail({
    from,
    to,
    subject: 'Your Habitra password reset code',
    text: `Your password reset code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
        <h2 style="color:#2f5148;">Reset your password</h2>
        <p>Use the code below to reset your Habitra password. It expires in 10 minutes.</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; text-align: center; padding: 16px; background: #f4f1ea; border-radius: 12px;">${code}</p>
        <p style="color:#666; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return { delivered: true };
}

module.exports = { sendResetCodeEmail, isMailerConfigured };
