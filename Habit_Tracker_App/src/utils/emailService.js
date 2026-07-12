// ─── Password reset email delivery ───────────────────────────────────────────
// Sending a real email from a pure frontend app requires a third-party email
// service with its own credentials — there's no way around that (same deal
// as Google sign-in needing a Client ID). This uses EmailJS, which sends
// email directly from the browser without a backend.
//
// Setup for real email delivery (takes ~5 minutes):
// 1. Create a free account at https://www.emailjs.com
// 2. Add an Email Service (e.g. connect your Gmail) — note its Service ID
// 3. Create an Email Template with these variables in the body:
//      {{to_email}}  {{to_name}}  {{code}}
//    e.g. "Hi {{to_name}}, your Habit Tracker password reset code is {{code}}."
//    Note its Template ID.
// 4. Find your Public Key under Account → General.
// 5. Put all three in .env at the project root:
//      VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
//      VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
//      VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
// 6. Restart `npm run dev`.
//
// Without those set, sendResetCodeEmail() below falls back to "demo mode":
// it doesn't send anything, and instead hands the code back to the caller so
// the UI can display it directly — so the whole forgot-password flow is
// still fully testable before you wire up real email.

import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export const emailServiceConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

/**
 * Send a password reset code to the given email.
 * Returns { demo: true, code } if EmailJS isn't configured (nothing sent,
 * caller should show the code directly), or { demo: false } on real success.
 * Throws if EmailJS is configured but sending fails.
 */
export async function sendResetCodeEmail({ toEmail, toName, code }) {
  if (!emailServiceConfigured) {
    return { demo: true, code }
  }

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    { to_email: toEmail, to_name: toName, code },
    { publicKey: PUBLIC_KEY }
  )

  return { demo: false }
}
