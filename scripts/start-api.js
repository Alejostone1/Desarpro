// Arranque de producción Railway: schema SQLite + seed seguro + Express.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function logDbTarget() {
  const url = process.env.DATABASE_URL || 'file:./dev.db';
  if (url.startsWith('file:')) {
    const dbPath = url.replace(/^file:/, '');
    console.log('[start-api] SQLite:', dbPath);
    if (dbPath.startsWith('/data')) {
      if (fs.existsSync('/data')) {
        console.log('[start-api] /data montado');
        if (fs.existsSync(dbPath)) {
          const stat = fs.statSync(dbPath);
          console.log('[start-api] BD existente:', dbPath, `(${(stat.size / 1024).toFixed(1)} KB)`);
        } else {
          console.log('[start-api] BD nueva se creará en:', dbPath);
        }
      } else {
        console.warn('[start-api] ADVERTENCIA: DATABASE_URL apunta a /data pero el directorio no existe.');
        console.warn('[start-api] Configure un Volume Railway con mount path /data para persistencia.');
      }
    }
  } else {
    console.log('[start-api] DATABASE_URL configurada (no file:)');
  }
}

logDbTarget();

const skipSetup = process.env.RUN_DB_SETUP === '0';
const skipSeed = process.env.SEED_ON_START === '0';

if (!skipSetup) {
  execSync('npx prisma generate', { stdio: 'inherit' });
  execSync('npx prisma db push', { stdio: 'inherit' });
  if (!skipSeed) {
    try {
      execSync('node seed.js', { stdio: 'inherit' });
    } catch (err) {
      console.warn('[start-api] seed omitido o parcial:', err.message || err);
    }
  } else {
    console.log('[start-api] SEED_ON_START=0 — seed omitido');
  }
} else {
  console.log('[start-api] RUN_DB_SETUP=0 — prisma generate/db push/seed omitidos');
}

require(path.join(__dirname, '..', 'server.js'));
