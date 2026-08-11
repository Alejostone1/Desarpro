// Arranque de producción: prepara SQLite + seed y levanta Express.
const { execSync } = require('child_process');
const path = require('path');

if (process.env.RUN_DB_SETUP !== '0') {
  execSync('npx prisma db push', { stdio: 'inherit' });
  try {
    execSync('node seed.js', { stdio: 'inherit' });
  } catch (err) {
    console.warn('[start-api] seed omitido o parcial:', err.message || err);
  }
}

require(path.join(__dirname, '..', 'server.js'));
