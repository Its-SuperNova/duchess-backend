const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, 'env.example');
const envLocalPath = path.join(__dirname, '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local file already exists');
  console.log('Please make sure it contains your Supabase credentials:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
} else {
  // Copy from env.example to .env.local
  const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
  fs.writeFileSync(envLocalPath, envExampleContent);
  
  console.log('✅ Created .env.local file from env.example');
  console.log('📝 Please update .env.local with your actual credentials:');
  console.log('1. Get your Supabase URL and anon key from your Supabase project');
  console.log('2. Replace the placeholder values in .env.local');
  console.log('3. Restart your development server');
}

console.log('\n🔧 To fix the RLS error, run this SQL in your Supabase SQL Editor:');
console.log('DROP POLICY IF EXISTS "Users can view own data" ON public.users;');
console.log('DROP POLICY IF EXISTS "Users can update own data" ON public.users;');
console.log('DROP POLICY IF EXISTS "Users can insert own data" ON public.users;');
console.log('CREATE POLICY "Allow all operations for NextAuth users" ON public.users FOR ALL USING (true) WITH CHECK (true);'); 