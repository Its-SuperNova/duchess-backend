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
