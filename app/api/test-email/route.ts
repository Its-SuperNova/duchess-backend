import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function GET() {
  try {
    // Check if environment variables are set
    if (
      !process.env.SMTP_HOST ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Email configuration missing",
          missing: {
            SMTP_HOST: !process.env.SMTP_HOST,
            EMAIL_USER: !process.env.EMAIL_USER,
            EMAIL_PASS: !process.env.EMAIL_PASS,
          },
        },
        { status: 400 }
      );
    }

    // Send test email
    await sendMail(
      process.env.EMAIL_USER,
      "Test Email - Duchess Pastry",
      `
        <h2>Test Email 🎉</h2>
        <p>This is a test email to verify the email configuration is working correctly.</p>
        <p>If you receive this email, the order confirmation system is ready to use!</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    );

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      config: {
        host: process.env.SMTP_HOST,
        user: process.env.EMAIL_USER,
        port: process.env.SMTP_PORT || 465,
      },
    });
  } catch (error) {
    console.error("Test email failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
