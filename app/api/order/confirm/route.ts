import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email, orderId, items } = await req.json();

    // Validate required fields
    if (
      !email ||
      !orderId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: email, orderId, and items array",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const orderDetails = items
      .map(
        (
          item: any
        ) => `<li style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 500;">${item.name}</span>
        <span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Qty: ${item.quantity}</span>
      </li>`
      )
      .join("");

    await sendMail(
      email,
      `Order Confirmation #${orderId}`,
      `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #523435 0%, #8B4513 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-id { background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #523435; }
            .items-list { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .item { padding: 10px 0; border-bottom: 1px solid #eee; }
            .item:last-child { border-bottom: none; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍰 Duchess Pastry</div>
              <h1>Order Confirmed!</h1>
              <p>Thank you for choosing us</p>
            </div>
            <div class="content">
              <div class="order-id">
                <h2>Order #${orderId}</h2>
                <p>Your order has been successfully placed and confirmed.</p>
              </div>
              
              <div class="items-list">
                <h3>📦 Your Order Items:</h3>
                <ul style="list-style: none; padding: 0;">
                  ${orderDetails}
                </ul>
              </div>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>🚚 What's Next?</h3>
                <p>We're preparing your delicious treats! You'll receive another email once your order is out for delivery.</p>
              </div>
              
              <div class="footer">
                <p>If you have any questions, please contact us at hello@duchesspastry.com</p>
                <p>Thank you for choosing Duchess Pastry! 🎉</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    );

    console.log("Email sent successfully to:", email);
    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    console.error("Error in order confirmation API:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
