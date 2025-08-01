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
        (item: any) => `
          <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
              <div style="font-weight: 500; color: #1a1a1a; margin-bottom: 4px;">${item.name}</div>
            </td>
            <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
              <span style="background: #f8f9fa; color: #6b7280; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 500;">
                Qty: ${item.quantity}
              </span>
            </td>
          </tr>
        `
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
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              line-height: 1.6; 
              color: #1a1a1a; 
              margin: 0; 
              padding: 0; 
              background-color: #f8f9fa; 
            }
            .container { 
              max-width: 600px; 
              margin: 40px auto; 
              background: white; 
              border-radius: 16px; 
              overflow: hidden; 
              box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
            }
            .header { 
              background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%); 
              color: white; 
              padding: 48px 40px; 
              text-align: center; 
            }
            .logo { 
              font-size: 32px; 
              font-weight: 700; 
              letter-spacing: -0.5px; 
              margin-bottom: 8px; 
            }
            .tagline { 
              font-size: 14px; 
              opacity: 0.8; 
              font-weight: 400; 
              letter-spacing: 0.5px; 
              text-transform: uppercase; 
            }
            .content { 
              padding: 48px 40px; 
            }
            .greeting { 
              font-size: 24px; 
              font-weight: 600; 
              color: #2d3748; 
              margin: 0 0 24px 0; 
            }
            .order-card { 
              background: #f8f9fa; 
              border: 1px solid #e2e8f0; 
              border-radius: 12px; 
              padding: 32px; 
              margin: 32px 0; 
              text-align: center; 
            }
            .order-label { 
              font-size: 14px; 
              color: #6b7280; 
              font-weight: 500; 
              margin-bottom: 8px; 
              text-transform: uppercase; 
              letter-spacing: 0.5px; 
            }
            .order-number { 
              font-size: 28px; 
              font-weight: 700; 
              color: #2d3748; 
              letter-spacing: -0.5px; 
            }
            .section-title { 
              font-size: 18px; 
              font-weight: 600; 
              color: #2d3748; 
              margin: 40px 0 24px 0; 
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 24px 0; 
            }
            .next-steps { 
              background: #f0f9ff; 
              border: 1px solid #bae6fd; 
              border-radius: 12px; 
              padding: 32px; 
              margin: 32px 0; 
            }
            .step { 
              display: flex; 
              align-items: flex-start; 
              margin-bottom: 16px; 
            }
            .step:last-child { 
              margin-bottom: 0; 
            }
            .step-icon { 
              width: 20px; 
              height: 20px; 
              background: #3b82f6; 
              border-radius: 50%; 
              margin-right: 16px; 
              margin-top: 2px; 
              flex-shrink: 0; 
              position: relative; 
            }
            .step-icon::after { 
              content: '✓'; 
              position: absolute; 
              top: 50%; 
              left: 50%; 
              transform: translate(-50%, -50%); 
              color: white; 
              font-size: 12px; 
              font-weight: bold; 
            }
            .contact-section { 
              background: #f8f9fa; 
              border-radius: 12px; 
              padding: 32px; 
              margin: 32px 0; 
              text-align: center; 
            }
            .contact-title { 
              font-size: 16px; 
              font-weight: 600; 
              color: #2d3748; 
              margin-bottom: 16px; 
            }
            .contact-info { 
              color: #6b7280; 
              line-height: 1.8; 
            }
            .contact-info a { 
              color: #3b82f6; 
              text-decoration: none; 
            }
            .footer { 
              text-align: center; 
              padding: 32px 40px; 
              background: #f8f9fa; 
              border-top: 1px solid #e2e8f0; 
            }
            .footer-brand { 
              font-size: 18px; 
              font-weight: 600; 
              color: #2d3748; 
              margin-bottom: 8px; 
            }
            .footer-text { 
              font-size: 14px; 
              color: #6b7280; 
              margin: 0; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Duchess Pastry</div>
              <div class="tagline">Artisan Confections</div>
            </div>
            
            <div class="content">
              <h1 class="greeting">Thank you for your order!</h1>
              <p style="color: #6b7280; font-size: 16px; margin-bottom: 0;">
                We're delighted to confirm that your order has been successfully placed and our artisans are preparing your treats with the utmost care.
              </p>
              
              <div class="order-card">
                <div class="order-label">Order Reference</div>
                <div class="order-number">#${orderId}</div>
              </div>
              
              <h2 class="section-title">Order Summary</h2>
              <table class="items-table">
                <tbody>
                  ${orderDetails}
                </tbody>
              </table>
              
              <div class="next-steps">
                <h3 style="margin: 0 0 24px 0; font-size: 16px; font-weight: 600; color: #2d3748;">What happens next?</h3>
                <div class="step">
                  <div style="color: #3b82f6; font-weight: 600; margin-right: 12px; min-width: 20px;">1.</div>
                  <div>Our artisans will begin crafting your order with premium ingredients</div>
                </div>
                <div class="step">
                  <div style="color: #3b82f6; font-weight: 600; margin-right: 12px; min-width: 20px;">2.</div>
                  <div>You'll receive real-time updates on your order status via email</div>
                </div>
                <div class="step">
                  <div style="color: #3b82f6; font-weight: 600; margin-right: 12px; min-width: 20px;">3.</div>
                  <div>We'll notify you when your order is ready for pickup or delivery</div>
                </div>
                <div class="step">
                  <div style="color: #3b82f6; font-weight: 600; margin-right: 12px; min-width: 20px;">4.</div>
                  <div>Estimated completion time will be provided based on your selection</div>
                </div>
              </div>
            </div>
            
            <div class="contact-section">
              <div class="contact-title">Need assistance?</div>
              <div class="contact-info">
                <strong>Email:</strong> <a href="mailto:hello@duchesspastry.com">hello@duchesspastry.com</a><br>
                <strong>Phone:</strong> <a href="tel:+919876543210">+91 98765 43210</a><br>
                <strong>Address:</strong> 7/68 62-B Vijayalakshmi Nagar, Sivasakthi Gardens<br>
                Keeranatham, Saravanampatti, Coimbatore – 641035
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
