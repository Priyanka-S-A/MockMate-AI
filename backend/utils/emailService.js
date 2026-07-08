import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email, otp, type = 'registration') => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const subject = type === 'registration' 
    ? 'Verify your MockMate AI Account' 
    : 'Reset your MockMate AI Password';

  const htmlContent = `
    <div style="font-family: 'Outfit', sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 16px; max-width: 500px; margin: auto; border: 1px border #262626;">
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

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: parseInt(port) === 465, // true for 465, false for other ports
        auth: { user, pass }
      });

      await transporter.sendMail({
        from: `"MockMate AI" <${user}>`,
        to: email,
        subject,
        html: htmlContent
      });
      console.log(`📧 Email sent successfully using SMTP to: ${email}`);
      return true;
    } catch (error) {
      console.error('SMTP Mail Dispatch Error, falling back to console:', error.message);
    }
  }

  // Fallback console log for local development/testing
  console.log('\n========================================================================');
  console.log(`📧 [MOCK EMAIL DISPATCHER]`);
  console.log(`To:      ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`OTP:     ${otp} (Expires in 5 minutes)`);
  console.log('========================================================================\n');
  return true;
};
