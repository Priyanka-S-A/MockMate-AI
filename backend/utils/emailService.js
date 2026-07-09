import nodemailer from 'nodemailer';

// Maximum time (ms) we will wait for SMTP before giving up and falling back.
const SMTP_TIMEOUT_MS = 5000;

/**
 * Attempts to send an OTP email via SMTP.
 * Hard-limited to SMTP_TIMEOUT_MS via Promise.race — never hangs the caller.
 * On any failure (network unreachable, timeout, bad credentials) the OTP is
 * printed clearly to the server console so Render logs always show it.
 */
export const sendOtpEmail = async (email, otp, type = 'registration') => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const subject = type === 'registration'
    ? 'Verify your MockMate AI Account'
    : 'Reset your MockMate AI Password';

  const htmlContent = `
    <div style="font-family: 'Outfit', sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 16px; max-width: 500px; margin: auto; border: 1px solid #262626;">
      <h2 style="color: #D4AF37; text-align: center; font-size: 24px; font-weight: 800; margin-bottom: 20px; letter-spacing: 1px;">MockMate AI</h2>
      <p style="font-size: 14px; color: #a3a3a3; line-height: 1.6; text-align: center;">
        Thank you for choosing MockMate AI. Use the 6-digit One-Time Password (OTP) below to complete your ${type === 'registration' ? 'registration' : 'password reset'}:
      </p>
      <div style="background-color: #171717; border: 1px solid #262626; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 6px; font-family: monospace;">${otp}</span>
      </div>
      <p style="font-size: 11px; color: #737373; text-align: center; margin-top: 20px;">
        This OTP is valid for 5 minutes. If you did not request this code, please ignore this email.
      </p>
    </div>
  `;

  // ── Console fallback (always available) ─────────────────────────────────────
  const logOtpToConsole = (reason) => {
    console.log('\n========================================================================');
    console.log(`📧 [OTP FALLBACK — ${reason}]`);
    console.log(`To:      ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`OTP:     ${otp}  (valid for 5 minutes)`);
    console.log('========================================================================\n');
  };

  if (host && user && pass) {
    try {
      // Build a timeout promise that rejects after SMTP_TIMEOUT_MS
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`SMTP timed out after ${SMTP_TIMEOUT_MS}ms`)),
          SMTP_TIMEOUT_MS
        )
      );

      const smtpPromise = (async () => {
        const transporter = nodemailer.createTransport({
          host,
          port: parseInt(port),
          secure: parseInt(port) === 465,
          auth: { user, pass },
          // Hard connection-level timeouts — nodemailer gives up fast on its own too
          connectionTimeout: SMTP_TIMEOUT_MS,
          greetingTimeout: SMTP_TIMEOUT_MS,
          socketTimeout: SMTP_TIMEOUT_MS,
        });

        await transporter.sendMail({
          from: `"MockMate AI" <${user}>`,
          to: email,
          subject,
          html: htmlContent,
        });
      })();

      // Race: if SMTP takes longer than SMTP_TIMEOUT_MS the timeout wins
      await Promise.race([smtpPromise, timeoutPromise]);
      console.log(`📧 [Email Service] OTP email sent successfully via SMTP to: ${email}`);
      return true;
    } catch (error) {
      // SMTP failed or timed out — log OTP to console so it is visible in Render logs
      console.error(`[Email Service] SMTP failed (${error.message}). Falling back to console log.`);
      logOtpToConsole('SMTP FAILURE');
    }
  } else {
    // No SMTP credentials configured — development / local fallback
    logOtpToConsole('SMTP NOT CONFIGURED');
  }

  return true; // Always resolves — the registration request is never blocked
};
