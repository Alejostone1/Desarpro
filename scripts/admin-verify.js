// Admin CMS E2E verify — requires preview on :3000 and API on :3001 with local build.
const path = require('path');
const fs = require('fs');
const puppeteerPaths = [
  'puppeteer-core',
  path.join(process.env.APPDATA || '', '..', 'Local', 'Temp', 'opencode', 'node_modules', 'puppeteer-core'),
  'C:\\Users\\ACER\\AppData\\Local\\Temp\\opencode\\node_modules\\puppeteer-core',
];
let puppeteer;
for (const p of puppeteerPaths) {
  try { puppeteer = require(p); break; } catch (e) { /* try next */ }
}
if (!puppeteer) {
  console.error('puppeteer-core not found — install devDependency or run from opencode temp');
  process.exit(2);
}

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Android.13';
const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.E2E_BASE || 'http://localhost:3000';
const API = process.env.E2E_API || 'http://localhost:3001';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
function check(name, cond, extra) {
  results.push({ name, ok: !!cond, extra });
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (cond ? '' : (extra ? ' | ' + JSON.stringify(extra) : '')));
}

(async () => {
  if (!fs.existsSync(CHROME)) {
    console.error('Chrome not found at', CHROME);
    process.exit(2);
  }
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1280,900'],
    defaultViewport: { width: 1280, height: 900 },
  });
  const page = await browser.newPage();
  await page.setDefaultTimeout(30000);
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));

  await page.goto(BASE + '/#/login', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
  await sleep(1200);
  await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent && x.textContent.trim() === 'Admin'); if (b) b.click(); });
  await sleep(500);
  await page.evaluate((pwd) => {
    const inp = document.querySelector('input[type="password"]');
    if (inp) {
      const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      s.call(inp, pwd);
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, DEMO_PASSWORD);
  await sleep(200);
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent && (x.textContent.includes('Entrar al panel') || x.textContent.includes('Sign in to panel')));
    if (b) b.click();
  });
  await sleep(3000);
  check('admin: logged in and on admin route', await page.evaluate(() => (window.location.hash || '').replace(/^#\/?/, '') === 'admin'));
  check('admin: no page errors so far', errs.length === 0, errs.slice(0, 2));

  // Open Hero section — expand content group only if Hero tab is not visible yet
  const heroClicked = await page.evaluate(() => {
    const findHero = () => document.querySelector('button[data-nav-id="hero"]')
      || Array.from(document.querySelectorAll('button')).find((x) => {
      const t = (x.textContent || '').replace(/\s+/g, ' ').trim();
      return t === 'Hero' || t.startsWith('Hero') || /\bHero\b/.test(t);
    });
    let hero = findHero();
    if (!hero) {
      const groupBtn = Array.from(document.querySelectorAll('button')).find((x) => {
        const t = (x.textContent || '').trim();
        return /Contenido|Site content|Conteúdo|Website-Inhalt|Contenu du site/i.test(t);
      });
      if (groupBtn) groupBtn.click();
      hero = findHero();
    }
    if (hero) { hero.click(); return true; }
    return false;
  });
  check('admin: hero section tab found', heroClicked);
  await sleep(1500);
  const hasLine1 = await page.evaluate(() => Array.from(document.querySelectorAll('code')).some((c) => c.textContent.trim() === 'hero.title.line1'));
  check('admin: content editor shows hero.title.line1', hasLine1);

  const testValue = 'TEST ADMIN CMS 9922';
  const typed = await page.evaluate((fieldKey, val) => {
    const code = Array.from(document.querySelectorAll('code')).find((c) => c.textContent.trim() === fieldKey);
    if (!code) return 'no-code';
    const wrap = code.closest('div')?.parentElement;
    const inp = wrap?.querySelector('input, textarea');
    if (!inp) return 'no-input';
    const proto = inp.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const s = Object.getOwnPropertyDescriptor(proto, 'value').set;
    s.call(inp, val);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    return 'ok';
  }, 'hero.title.line1', testValue);
  check('admin: typed value', typed === 'ok', typed);
  await sleep(300);
  const saved = await page.evaluate((fieldKey) => {
    const code = Array.from(document.querySelectorAll('code')).find((c) => c.textContent.trim() === fieldKey);
    if (!code) return 'no-code';
    const wrap = code.closest('div')?.parentElement;
    const b = Array.from(wrap?.querySelectorAll('button') || []).find((x) => x.textContent && x.textContent.includes('Guardar') && !x.disabled);
    if (b) { b.click(); return 'clicked'; }
    return 'no-save';
  }, 'hero.title.line1');
  check('admin: save clicked', saved === 'clicked', saved);
  await sleep(2000);
  const ver = await (await fetch(API + '/api/content?lang=es')).json();
  check('admin: value persisted in DB', ver.content['hero.title.line1'] === testValue, ver.content['hero.title.line1']);

  await page.evaluate(() => localStorage.setItem('desarpro:language', 'es'));
  await page.goto(BASE + '/#/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction((tv) => document.body.textContent.includes(tv) || document.body.textContent.length > 2000, { timeout: 30000 }, testValue);
  check('public: hero shows edited value', await page.evaluate((tv) => document.body.textContent.includes(tv), testValue));

  const orig = 'Tecnología que';
  const tokenRes = await page.evaluate(() => sessionStorage.getItem('desarpro:admin:token'));
  if (tokenRes) {
    await fetch(API + '/api/admin/content/hero.title.line1', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': tokenRes }, body: JSON.stringify({ lang: 'es', value: orig }) });
    const ver2 = await (await fetch(API + '/api/content?lang=es')).json();
    check('admin: reverted value', ver2.content['hero.title.line1'] === orig, ver2.content['hero.title.line1']);
  }

  await browser.close();
  const passed = results.filter((r) => r.ok).length;
  console.log(`\nE2E admin: ${passed}/${results.length} passed`);
  process.exit(results.every((r) => r.ok) ? 0 : 1);
})().catch((e) => { console.error('SCRIPT ERROR:', e); process.exit(2); });
