import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, orderId, items, isTest = false } = await req.json();

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

    let order = null;

    // For test mode, skip database lookup and create mock order data
    if (isTest) {
      console.log("Test mode: Using mock order data");
      order = {
        id: orderId,
        total_amount: items.reduce(
          (sum: number, item: any) => sum + item.total_price,
          0
        ),
        status: "confirmed",
        created_at: new Date().toISOString(),
        delivery_address: "Test Address, Test City, Test State - 123456",
        delivery_phone: "9876543210",
        delivery_name: "Test Customer",
      };
    } else {
      // Fetch order details from database
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError || !orderData) {
        console.error("Error fetching order:", orderError);
        return NextResponse.json(
          { success: false, error: "Order not found" },
          { status: 404 }
        );
      }
      order = orderData;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Fetch correct product prices from database
    const itemsWithPrices = await Promise.all(
      items.map(async (item: any) => {
        try {
          // Extract product ID from item name or use a fallback
          const productId = item.productId || item.id || item.name;

          // Fetch product details from database
          const { data: product, error } = await supabase
            .from("products")
            .select("id, name, price, weight_options, piece_options")
            .eq("name", item.name)
            .single();

          if (error || !product) {
            console.log(
              `Product not found for: ${item.name}, using fallback price`
            );
            return {
              ...item,
              price: item.price || 0, // Use existing price as fallback
            };
          }

          // Get the correct price based on product options
          let correctPrice = product.price || 0;

          // If product has weight or piece options, use the first active option
          if (product.weight_options && product.weight_options.length > 0) {
            const activeWeightOption = product.weight_options.find(
              (opt: any) => opt.isActive
            );
            if (activeWeightOption) {
              correctPrice =
                parseInt(activeWeightOption.price) || product.price || 0;
            }
          } else if (
            product.piece_options &&
            product.piece_options.length > 0
          ) {
            const activePieceOption = product.piece_options.find(
              (opt: any) => opt.isActive
            );
            if (activePieceOption) {
              correctPrice =
                parseInt(activePieceOption.price) || product.price || 0;
            }
          }

          console.log(
            `Product: ${item.name}, Original price: ${item.price}, Correct price: ${correctPrice}`
          );

          return {
            ...item,
            price: correctPrice,
          };
        } catch (error) {
          console.error(`Error fetching price for ${item.name}:`, error);
          return {
            ...item,
            price: item.price || 0, // Use existing price as fallback
          };
        }
      })
    );

    console.log("Items with corrected prices:", itemsWithPrices);

    // Calculate totals
    console.log(
      "Items received for email:",
      JSON.stringify(itemsWithPrices, null, 2)
    );

    const subtotal = itemsWithPrices.reduce((sum: number, item: any) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      const itemTotal = price * quantity;
      console.log(
        `Item: ${item.name}, Price: ${price}, Qty: ${quantity}, Total: ${itemTotal}`
      );
      return sum + itemTotal;
    }, 0);

    console.log("Subtotal calculated:", subtotal);

    // Use actual order data for calculations
    const deliveryCharge = order.delivery_charge || 0;
    const cgst = order.cgst || 0;
    const sgst = order.sgst || 0;
    const total = order.total_amount || subtotal + deliveryCharge + cgst + sgst;

    console.log("Final calculations from order data:", {
      subtotal,
      deliveryCharge,
      cgst,
      sgst,
      total,
    });

    const orderDetails = itemsWithPrices
      .map(
        (item: any) => `
          <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
              <div style="font-weight: 500; color: #1a1a1a; margin-bottom: 4px;">${
                item.name
              }</div>
            </td>
            <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0; text-align: center;">
              <span style="background: #f8f9fa; color: #6b7280; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 500;">
                Qty: ${item.quantity}
              </span>
            </td>
            <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
              <div style="font-weight: 600; color: #2d3748;">₹${(
                (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)
              ).toFixed(2)}</div>
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
              <div class="logo" style="color: white !important; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 8px;">Duchess Pastry</div>
              <div class="tagline" style="color: white !important; font-size: 14px; opacity: 0.8; font-weight: 400; letter-spacing: 0.5px; text-transform: uppercase;">Artisan Confections</div>
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
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 16px 0; border-bottom: 1px solid #f0f0f0;">Item</th>
                    <th style="text-align: center; padding: 16px 0; border-bottom: 1px solid #f0f0f0;">Qty</th>
                    <th style="text-align: right; padding: 16px 0; border-bottom: 1px solid #f0f0f0;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderDetails}
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
            
            <div class="footer">
              <div class="footer-brand">Duchess Pastry</div>
              <p class="footer-text">Crafting moments of sweetness since day one</p>
            </div>
          </div>
        </body>
        </html>
      `
    );

    // Send admin notification email
    await sendMail(
      "hello@duchesspastry.com",
      `New Order Received - Duchess Pastry #${orderId}`,
      `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Notification - Duchess Pastry</title>
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
            .customer-info { 
              background: #f8f9fa; 
              border-radius: 12px; 
              padding: 24px; 
              margin: 24px 0; 
            }
            .customer-title { 
              font-size: 16px; 
              font-weight: 600; 
              color: #2d3748; 
              margin-bottom: 16px; 
            }
            .customer-details { 
              color: #6b7280; 
              line-height: 1.8; 
            }
            .action-section { 
              background: #fef3c7; 
              border: 1px solid #fde68a; 
              border-radius: 12px; 
              padding: 32px; 
              margin: 32px 0; 
              text-align: center; 
            }
            .action-title { 
              font-size: 16px; 
              font-weight: 600; 
              color: #92400e; 
              margin-bottom: 16px; 
            }
            .action-steps { 
              color: #92400e; 
              line-height: 1.8; 
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
              <div class="tagline" style="color: white !important; font-size: 14px; opacity: 0.8; font-weight: 400; letter-spacing: 0.5px; text-transform: uppercase;">New Order Alert</div>
            </div>
            
            <div class="content">
              <h1 class="greeting">New Order Received! 🎉</h1>
              <p style="color: #6b7280; font-size: 16px; margin-bottom: 0;">
                A new order has been placed and requires your attention. Please review the details below and begin processing.
              </p>
              
              <div class="order-card">
                <div class="order-label">Order Reference</div>
                <div class="order-number">#${orderId}</div>
              </div>
              
              <div class="customer-info">
                <div class="customer-title">Customer Information</div>
                <div class="customer-details">
                  <strong>Email:</strong> ${email}<br>
                  <strong>Order Date:</strong> ${new Date().toLocaleDateString(
                    "en-IN"
                  )}<br>
                  <strong>Order Time:</strong> ${new Date().toLocaleTimeString(
                    "en-IN"
                  )}
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
                  ${orderDetails}
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
            </div>
            
            <div class="footer">
              <div class="footer-brand">Duchess Pastry</div>
              <p class="footer-text">Admin Notification System</p>
            </div>
          </div>
        </body>
        </html>
      `
    );

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
