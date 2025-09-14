#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Environment Setup');
console.log('====================\n');

const envPath = path.join(__dirname, '../.env.local');
const envExample = `# Payment Configuration (To be implemented)
# Add your payment provider configuration here
# PAYMENT_PROVIDER_KEY=your_payment_provider_key_here
# PAYMENT_PROVIDER_SECRET=your_payment_provider_secret_here
# PAYMENT_WEBHOOK_SECRET=your_webhook_secret_here

# Supabase Configuration
# Get these from: https://supabase.com/dashboard/project/[YOUR_PROJECT]/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth Configuration (if using)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000`;

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!');
  console.log('Current contents:');
  console.log('------------------');
  console.log(fs.readFileSync(envPath, 'utf8'));
  console.log('\nIf you need to update it, please edit the file manually.');
} else {
  console.log('📝 Creating .env.local file...');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env.local created successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Configure your payment provider API keys');
  console.log('2. Get your Supabase credentials from: https://supabase.com/dashboard/project/[YOUR_PROJECT]/settings/api');
  console.log('3. Replace the placeholder values in .env.local with your actual credentials');
  console.log('4. Restart your development server: npm run dev');
}

console.log('\n🔗 Useful Links:');
console.log('- Supabase Dashboard: https://supabase.com/dashboard');
console.log('- Payment Provider Documentation: (to be configured)');

console.log('\n📚 Documentation:');
console.log('- Setup Guide: docs/ (to be created)');
console.log('- Troubleshooting: docs/ (to be created)');
console.log('- Testing Guide: docs/ (to be created)');
