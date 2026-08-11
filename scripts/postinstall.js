// postinstall — Prisma solo donde hace falta (local + Railway). Vercel = frontend estático.
const { execSync } = require('child_process');

if (process.env.VERCEL === '1') {
  console.log('[postinstall] Vercel: omitiendo prisma generate (solo frontend)');
  process.exit(0);
}

execSync('npx prisma generate', { stdio: 'inherit' });
