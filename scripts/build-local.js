// Local production build with API pointing to localhost:3001
const { execSync } = require('child_process');
process.env.VITE_API_URL = process.env.VITE_API_URL || 'http://localhost:3001';
execSync('node ./node_modules/vite/bin/vite.js build', { stdio: 'inherit' });
execSync('node copy-build-assets.js', { stdio: 'inherit' });
execSync('node scripts/inject-api-url.js', { stdio: 'inherit', env: process.env });
console.log('[build:local] Ready for E2E with API at', process.env.VITE_API_URL);
