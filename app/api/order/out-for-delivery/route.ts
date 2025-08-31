import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const {
      orderId,
      customerEmail,
      customerName,
      orderNumber,
      deliveryAddress,
      estimatedTime,
    } = await req.json();

    // Validate required fields
    if (!orderId || !customerEmail || !customerName || !orderNumber) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: orderId, customerEmail, customerName, orderNumber",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Fetch order details from database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Fetch order items from database
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_name, quantity, unit_price")
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch order items" },
        { status: 500 }
      );
    }

    // Calculate order total
    const subtotal = orderItems.reduce((sum: number, item: any) => {
      return (
        sum +
        (parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 0)
      );
    }, 0);

    // Use actual order data for calculations
    const deliveryCharge = order.delivery_charge || 0;
    const cgst = order.cgst || 0;
    const sgst = order.sgst || 0;
    const total = order.total_amount || subtotal + deliveryCharge + cgst + sgst;

    // Generate order items HTML
    const orderItemsHtml = orderItems
      .map(
        (item: any) => `
          <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
              <div style="font-weight: 500; color: #1a1a1a; margin-bottom: 4px;">${
                item.product_name
              }</div>
            </td>
            <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0; text-align: center;">
              <span style="background: #f8f9fa; color: #6b7280; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 500;">
                Qty: ${item.quantity}
              </span>
            </td>
            <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
              <div style="font-weight: 600; color: #2d3748;">₹${(
                (parseFloat(item.unit_price) || 0) *
                (parseInt(item.quantity) || 0)
              ).toFixed(2)}</div>
            </td>
          </tr>
        `
      )
      .join("");

    await sendMail(
      customerEmail,
      `Your Order is Out for Delivery! 🚚 - Duchess Pastry #${orderNumber}`,
      `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Out for Delivery - Duchess Pastry</title>
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
              background: linear-gradient(135deg, #059669 0%, #10b981 100%); 
              color: white; 
              padding: 48px 40px; 
              text-align: center; 
            }
            .logo { 
              font-size: 32px; 
              font-weight: 700; 
              letter-spacing: -0.5px; 
              margin-bottom: 8px; 
              color: white !important; 
            }
            .tagline { 
              font-size: 14px; 
              opacity: 0.8; 
              font-weight: 400; 
              letter-spacing: 0.5px; 
              text-transform: uppercase; 
              color: white !important; 
            }
            .content { 
              padding: 48px 20px; 
            }
            .greeting { 
              font-size: 24px; 
              font-weight: 600; 
              color: #2d3748; 
              margin: 0 0 24px 0; 
            }
            .order-card { 
              background: #f0fdf4; 
              border: 1px solid #bbf7d0; 
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
              color: #059669; 
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
                         .delivery-info { 
               background: #eff6ff; 
               border: 1px solid #bfdbfe; 
               border-radius: 12px; 
               padding: 32px; 
               margin: 32px 0; 
             }
             .delivery-title { 
               font-size: 16px; 
               font-weight: 600; 
               color: #1e40af; 
               margin-bottom: 16px; 
             }
             .delivery-details { 
               color: #1e40af; 
               line-height: 1.8; 
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
              <div class="logo" style="color: white !important; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 8px;">Duchess Pastry</div>
              <div class="tagline" style="color: white !important; font-size: 14px; opacity: 0.8; font-weight: 400; letter-spacing: 0.5px; text-transform: uppercase;">On the Way!</div>
            </div>
            
            <div class="content">
              <h1 class="greeting">Your order is on the way! 🚚</h1>
              <p style="color: #6b7280; font-size: 16px; margin-bottom: 0;">
                Great news! Your order has been prepared with care and is now out for delivery. 
                Our delivery partner is on their way to bring your delicious treats to you.
              </p>
              
              <div class="order-card">
                <div class="order-label">Order Reference</div>
                <div class="order-number">#${orderNumber}</div>
              </div>
              
              <div class="delivery-info">
                <div class="delivery-title">Delivery Information</div>
                <div class="delivery-details">
                  <strong>Delivery Address:</strong><br>
                  ${deliveryAddress || "Address not specified"}<br><br>
                  ${
                    estimatedTime
                      ? `<strong>Estimated Delivery Time:</strong><br>${estimatedTime}<br><br>`
                      : ""
                  }
                  <strong>Status:</strong> Out for Delivery 🚚<br><br>
                  Please ensure someone is available to receive your order. 
                  Our delivery partner will contact you if needed.
                </div>
              </div>
              
              <h2 class="section-title">Order Summary</h2>
              <table class="items-table">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 16px 0; border-bottom: 1px solid #f0f0f0;">Item</th>
                    <th style="text-align: center; padding: 16px 0; border-bottom: 1px solid #f0f0f0;">Qty</th>
                    <th style="text-align: right; padding: 16px 0; border-bottom: 1px solid #f0f0f0;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>
              
              <div class="bill-details" style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #2d3748;">Bill Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500; text-align: left;">Subtotal:</td>
                    <td style="padding: 8px 0; font-weight: 600; color: #2d3748; text-align: right;">₹${subtotal.toFixed(
                      2
                    )}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500; text-align: left;">Delivery Charge:</td>
                    <td style="padding: 8px 0; font-weight: 600; color: #2d3748; text-align: right;">₹${deliveryCharge.toFixed(
                      2
                    )}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500; text-align: left;">CGST (9%):</td>
                    <td style="padding: 8px 0; font-weight: 600; color: #2d3748; text-align: right;">₹${cgst.toFixed(
                      2
                    )}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500; text-align: left;">SGST (9%):</td>
                    <td style="padding: 8px 0; font-weight: 600; color: #2d3748; text-align: right;">₹${sgst.toFixed(
                      2
                    )}</td>
                  </tr>
                  <tr style="border-top: 1px solid #e2e8f0;">
                    <td style="padding: 16px 0 8px 0; font-weight: 700; color: #2d3748; font-size: 16px; text-align: left;">Total Amount:</td>
                    <td style="padding: 16px 0 8px 0; font-weight: 700; color: #2d3748; font-size: 18px; text-align: right;">₹${total.toFixed(
                      2
                    )}</td>
                  </tr>
                </table>
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
            
            <div class="footer">
              <div class="footer-brand">Duchess Pastry</div>
              <p class="footer-text">Your sweet moments are on the way!</p>
            </div>
          </div>
        </body>
        </html>
      `
    );

    console.log("Out for delivery email sent successfully to:", customerEmail);
    return NextResponse.json({
      success: true,
      message: "Out for delivery email sent successfully",
    });
  } catch (err) {
    console.error("Error in out for delivery email API:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
