import { NextRequest, NextResponse } from "next/server";
import { getOTP, deleteOTP, clearExpiredOTPs } from "@/lib/otp-store";
import { upsertUser, getUserByEmail } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    console.log("🔍 OTP Verification Debug:", {
      email,
      otp,
    });

    if (!email || !otp) {
      console.log("❌ Missing email or OTP");
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Clear expired OTPs first
    clearExpiredOTPs();

    // Check if OTP exists and is not expired
    const storedOtpData = getOTP(email);
    console.log("🔍 Stored OTP Data:", storedOtpData);

    if (!storedOtpData) {
      console.log("❌ OTP not found in store");
      return NextResponse.json(
        { error: "OTP not found or expired" },
        { status: 400 }
      );
    }

    console.log("🔍 Time Check:", {
      currentTime: Date.now(),
      expiresAt: storedOtpData.expiresAt,
      isExpired: Date.now() > storedOtpData.expiresAt,
    });

    if (Date.now() > storedOtpData.expiresAt) {
      console.log("❌ OTP expired");
      deleteOTP(email); // Clean up expired OTP
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    console.log("🔍 OTP Comparison:", {
      storedOTP: storedOtpData.otp,
      providedOTP: otp,
      match: storedOtpData.otp === otp,
    });

    if (storedOtpData.otp !== otp) {
      console.log("❌ OTP mismatch");
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    console.log("✅ OTP verified successfully");
    // OTP is valid, clean it up
    deleteOTP(email);

    // Check if user exists, if not create them
    let user = await getUserByEmail(email);
    if (!user) {
      // Create new user with OTP authentication
      const userData = {
        email,
        name: email.split("@")[0], // Use email prefix as name
        provider: "otp",
        provider_id: `otp_${email}`,
      };

      user = await upsertUser(userData);
      if (!user) {
        return NextResponse.json(
          { error: "Failed to create user account" },
          { status: 500 }
        );
      }
    } else {
      // User exists (possibly from Google OAuth), update their provider info to include OTP
      console.log("🔄 User exists, updating provider info:", {
        existingProvider: user.provider,
        email: user.email,
      });

      // If user was created with Google OAuth, we can still authenticate them with OTP
      // The user account remains the same, just different authentication method
      if (user.provider === "google") {
        console.log("✅ Authenticating existing Google user with OTP");
      } else if (user.provider === "otp") {
        console.log("✅ Authenticating existing OTP user");
      }
    }

    // Create a session token for the user
    // In a real implementation, you might want to use JWT or NextAuth's session management
    const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString(
      "base64"
    );

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      user: {
        email: user.email,
        name: user.name,
        id: user.id,
      },
      sessionToken,
    });
  } catch (error) {
    console.error("Error in verify-otp API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
