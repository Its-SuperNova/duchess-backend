import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, updateUserProfile } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const { email, name, phoneNumber } = await request.json();

    console.log("📝 Update profile request:", { email, name, phoneNumber });

    if (!email || !name || !phoneNumber) {
      return NextResponse.json(
        { error: "Email, name, and phone number are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user profile
    const updatedUser = await updateUserProfile(email, {
      name,
      phone_number: phoneNumber,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    console.log("✅ Profile updated successfully:", updatedUser.email);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone_number: updatedUser.phone_number,
      },
    });
  } catch (error) {
    console.error("Error in update-profile API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
