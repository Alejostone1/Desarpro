const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, 'dist');

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist, { recursive: true });
}

// Copy static folders and files needed by in-browser Babel/JSX
const itemsToCopy = ['src', 'media', 'tokens.css', 'robots.txt'];

for (const item of itemsToCopy) {
  const srcPath = path.join(__dirname, item);
  const destPath = path.join(dist, item);
  if (fs.existsSync(srcPath)) {
    fs.cpSync(srcPath, destPath, { recursive: true });
    console.log(`[build] Copied ${item} -> dist/${item}`);
  }
}

console.log('[build] Production dist folder ready!');
