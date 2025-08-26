# Email Confirmation Setup

This document explains how to set up the order confirmation email functionality.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Email Configuration for Order Confirmation
EMAIL_USER=hello@duchesspastry.com
EMAIL_PASS=your-smtp-password-or-app-password
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=465
```

## Email Provider Examples

### Gmail (Recommended)

```bash
EMAIL_USER=hello@duchesspastry.com
EMAIL_PASS=your-16-character-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
```

**Note:** For Gmail, you need to:

1. Enable 2-factor authentication
2. Generate an App Password (16 characters)
3. Use the App Password instead of your regular password

### Outlook/Hotmail

```bash
EMAIL_USER=hello@duchesspastry.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Custom Domain (cPanel)

```bash
EMAIL_USER=hello@duchesspastry.com
EMAIL_PASS=your-email-password
SMTP_HOST=mail.duchesspastry.com
SMTP_PORT=465
```

## How It Works

1. When a customer completes checkout, the system automatically sends an order confirmation email
2. The email includes:

   - Order ID
   - List of purchased items with quantities
   - Next steps information
   - Contact information

3. The email is sent from `hello@duchesspastry.com` with a professional HTML template

## Files Created/Modified

- `lib/mailer.ts` - Email utility using Nodemailer
- `app/api/order/confirm/route.ts` - API endpoint for sending confirmation emails
- `app/checkout/checkout-client.tsx` - Modified to trigger email after successful order creation

## Testing

To test the email functionality:

1. Set up the environment variables
2. Complete a test order
3. Check the customer's email for the confirmation
4. Check the console logs for any email-related errors

## Troubleshooting

- **Email not sending**: Check SMTP credentials and port settings
- **Authentication failed**: Verify email password/app password
- **Connection timeout**: Check SMTP host and port configuration
- **Email in spam**: Ensure proper SPF/DKIM records for your domain
