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
      `Order Confirmation - Duchess Pastry #${orderId}`,
      `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - Duchess Pastry</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #523435 0%, #8B4513 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .order-id { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #523435; }
            .items-list { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; color: #666; font-size: 14px; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 15px; }
            .contact-info { background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0066cc; }
            .item { padding: 12px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
            .item:last-child { border-bottom: none; }
            .quantity { background: #523435; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍰 Duchess Pastry</div>
              <h1 style="margin: 0; font-size: 24px;">Order Confirmation</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your order has been successfully placed</p>
            </div>
            <div class="content">
              <h2 style="color: #523435; margin-top: 0;">Thank you for your order!</h2>
              <p>Dear Customer,</p>
              <p>We're excited to confirm that your order has been successfully placed and is now being prepared with care.</p>
              
              <div class="order-id">
                <strong style="font-size: 16px;">Order Reference:</strong><br>
                <span style="font-size: 20px; color: #523435; font-weight: bold;">#${orderId}</span>
              </div>
              
              <h3 style="color: #523435;">Order Summary:</h3>
              <div class="items-list">
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${orderDetails}
                </ul>
              </div>
              
              <h3 style="color: #523435;">What happens next?</h3>
              <ul style="padding-left: 20px;">
                <li>Our team will start preparing your order immediately</li>
                <li>You'll receive status updates via email</li>
                <li>We'll notify you when your order is out for delivery</li>
                <li>Estimated delivery time will be provided based on your location</li>
              </ul>
              
              <div class="contact-info">
                <strong>Need help?</strong><br>
                Email: <a href="mailto:hello@duchesspastry.com" style="color: #0066cc;">hello@duchesspastry.com</a><br>
                Address: 7/68 62-B Vijayalakshmi Nagar, Sivasakthi Gardens, Keeranatham, Saravanampatti, Coimbatore – 641035
              </div>
              
              <div class="footer">
                <p style="margin: 0 0 10px 0;"><strong>Duchess Pastry</strong></p>
                <p style="margin: 0; font-size: 12px;">Thank you for choosing us for your sweet cravings!</p>
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
