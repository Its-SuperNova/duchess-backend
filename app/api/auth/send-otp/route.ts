import { NextRequest, NextResponse } from "next/server";
import { sendOTPEmail } from "@/lib/mailer";
import { setOTP, clearExpiredOTPs } from "@/lib/otp-store";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Clear expired OTPs first
    await clearExpiredOTPs();

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now

    // Store OTP using persistent store
    await setOTP(email, otp, expiresAt);

    console.log("📧 OTP Generated:", {
      email,
      otp,
      expiresAt,
      expiresIn: new Date(expiresAt).toISOString(),
    });

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
      return NextResponse.json(
        { error: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error in send-otp API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
