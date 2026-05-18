const nodemailer = require("nodemailer");

let _transporter = null;

function getEmailTransporter() {
  if (_transporter) return _transporter;
  const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS } = process.env;
  if (EMAIL_HOST && EMAIL_USER && EMAIL_PASS) {
    _transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: parseInt(process.env.EMAIL_PORT) === 465,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
  }
  return _transporter;
}

/**
 * Send OTP to contact (email or phone).
 * Returns { sent: true, channel: "email"|"sms" } on success.
 * Returns { sent: false, devMode: true } when no provider is configured.
 */
async function sendOtp(contact, otp) {
  const isEmail = contact.includes("@");

  // ── Email via nodemailer ────────────────────────────────────────────────────
  if (isEmail) {
    const t = getEmailTransporter();
    if (t) {
      try {
        await t.sendMail({
          from: process.env.EMAIL_FROM || `HelloNeighbour <${process.env.EMAIL_USER}>`,
          to: contact,
          subject: "Your HelloNeighbour verification code",
          text: `Your OTP is: ${otp}\n\nExpires in 5 minutes. Never share this code.`,
          html: `
            <div style="font-family:sans-serif;max-width:460px;margin:auto;padding:24px">
              <h2 style="color:#10b981;margin:0 0 4px">HelloNeighbour</h2>
              <p style="color:#6b7280;margin:0 0 20px;font-size:14px">Your neighborhood community</p>
              <p style="color:#111827">Your verification code is:</p>
              <div style="font-size:40px;font-weight:700;letter-spacing:12px;color:#111827;
                          background:#f9fafb;border:2px solid #e5e7eb;border-radius:12px;
                          padding:16px 24px;text-align:center;margin:12px 0">${otp}</div>
              <p style="color:#6b7280;font-size:13px;margin-top:16px">
                This code expires in <strong>5 minutes</strong>.
                HelloNeighbour staff will <strong>never</strong> ask for this code.
              </p>
            </div>
          `,
        });
        return { sent: true, channel: "email" };
      } catch (err) {
        console.error("Email OTP failed:", err.message);
        // Fall through to dev mode
      }
    }
  }

  // ── SMS via Twilio (optional — add credentials to enable) ──────────────────
  if (!isEmail && process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
    try {
      const twilio = require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      await twilio.messages.create({
        body: `Your HelloNeighbour OTP: ${otp} (expires in 5 min). Do not share this.`,
        from: process.env.TWILIO_FROM,
        to: contact,
      });
      return { sent: true, channel: "sms" };
    } catch (err) {
      console.error("SMS OTP failed:", err.message);
    }
  }

  // ── Dev fallback ────────────────────────────────────────────────────────────
  console.log(`\n🔐 OTP for ${contact}: ${otp}  (expires in 5 min)\n`);
  return { sent: false, devMode: true };
}

module.exports = { sendOtp };
