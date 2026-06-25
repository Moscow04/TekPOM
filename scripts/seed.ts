/**
 * Database seed script.
 * Run: npx tsx scripts/seed.ts
 */
import { execSync } from 'child_process';

async function main() {
  console.log('🚀 TekTariq PM — One-Click Setup');
  console.log('================================\n');

  console.log('1. Generating JWT secret...');
  const crypto = await import('crypto');
  const secret = crypto.default.randomBytes(64).toString('hex');
  console.log(`   JWT_SECRET=${secret}\n`);

  console.log('2. Installing dependencies...');
  execSync('pnpm install', { stdio: 'inherit' });
  console.log('   Done!\n');

  console.log('3. Generating Prisma client...');
  execSync('pnpm db:generate', { stdio: 'inherit' });
  console.log('   Done!\n');

  console.log('4. Pushing database schema...');
  execSync('pnpm db:push', { stdio: 'inherit' });
  console.log('   Done!\n');

  console.log('5. Seeding database with sample data...');
  execSync('pnpm db:seed', { stdio: 'inherit' });
  console.log('   Done!\n');

  console.log('✅ Setup complete!');
  console.log('   Run: npm run dev    # starts all services in dev mode');
  console.log('   Or:  docker compose up -d  # starts all services in containers');
  console.log(`\n📝 Default login: superadmin@tektariq.com`);
  console.log(`🔑 Default password: TeKtArIq2024!`);
  console.log(`🔐 JWT Secret: ${secret}`);
}

main().catch((e) => {
  console.error('Setup failed:', e);
  process.exit(1);
});
