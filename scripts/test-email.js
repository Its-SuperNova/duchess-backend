// Test script for email functionality
// Run with: node scripts/test-email.js

const nodemailer = require('nodemailer');
const path = require('path');

// Load environment variables from .env.local file
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function testEmail() {
  console.log('Testing email configuration...');
  
  // Check environment variables
  const requiredVars = ['SMTP_HOST', 'EMAIL_USER', 'EMAIL_PASS'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.log('Please add them to your .env.local file');
    return;
  }

  console.log('✅ Environment variables found');
  console.log('SMTP Host:', process.env.SMTP_HOST);
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('SMTP Port:', process.env.SMTP_PORT || 465);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // Test connection
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful');

         // Send test email
     console.log('Sending test email...');
     const result = await transporter.sendMail({
       from: `"Duchess Pastry 🍰" <${process.env.EMAIL_USER}>`,
       to: "its.ashwin.23@gmail.com", // Send to specified email for testing
       subject: 'Test Email - Duchess Pastry Order Confirmation',
      html: `
        <h2>Test Email 🎉</h2>
        <p>This is a test email to verify the email configuration is working correctly.</p>
        <p>If you receive this email, the order confirmation system is ready to use!</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Check your email inbox for the test message.');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('💡 Authentication failed. Check your email password/app password.');
    } else if (error.code === 'ECONNECTION') {
      console.log('💡 Connection failed. Check your SMTP host and port settings.');
    }
  }
}

testEmail();
