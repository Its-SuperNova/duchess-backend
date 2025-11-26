import nodemailer from "nodemailer";

export const sendMail = async (to: string, subject: string, html: string) => {
  // Validate environment variables
  if (
    !process.env.SMTP_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    throw new Error(
      "Email configuration is missing. Please check your environment variables."
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Add proper headers to reduce spam likelihood
    headers: {
      "X-Priority": "1",
      "X-MSMail-Priority": "High",
      Importance: "high",
      "X-Mailer": "Duchess Pastry Order System",
    },
  });

  try {
    // Verify SMTP connection
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    const result = await transporter.sendMail({
      from: `"Duchess Pastry 🍰" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};

export const sendOTPEmail = async (email: string, otp: string) => {
  const subject = "Your Duchess Pastry Login Code";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login Code - Duchess Pastry</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0; font-size: 28px;">🍰 Duchess Pastry</h1>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your Login Code</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Enter this code to sign in</h2>
          <div style="background-color: #ffffff; border: 2px dashed #007bff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #666; margin: 15px 0 0 0; font-size: 14px;">This code will expire in 5 minutes</p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 14px; line-height: 1.5;">
          <p>If you didn't request this code, please ignore this email.</p>
          <p>For security reasons, never share this code with anyone.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2024 Duchess Pastry. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendMail(email, subject, html);
};
