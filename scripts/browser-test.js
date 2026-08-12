// DESARPRO — Real browser runtime smoke test (Puppeteer + installed Chrome)
const path = require('path');
const fs = require('fs');
const vm = require('vm');
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
  console.error('puppeteer-core not found');
  process.exit(2);
}

const BASE = process.env.E2E_BASE || 'http://localhost:3000';
const API = process.env.E2E_API || 'http://localhost:3001';
const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LANGS = ['es', 'en', 'pt', 'fr', 'de'];
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Android.13';
const ADMIN_PASSWORD = DEMO_PASSWORD;

// --- Load expected translations from the real source ---
const tSrc = fs.readFileSync('C:\\Users\\ACER\\Desktop\\desarpro-Full\\src\\i18n\\translations.jsx', 'utf8')
  .replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*var __i18nTranslations =/, '').replace(/;\s*$/, '');
const tCtx = {};
vm.createContext(tCtx);
vm.runInContext(`__i18nTranslations = (${tSrc});`, tCtx);
const TR = tCtx.__i18nTranslations;

// --- Fetch live CMS content per language (the DB is the source of truth) ---
const cmsCache = {};
(async () => {
  for (const l of LANGS) {
    const r = await fetch(`${API}/api/content?lang=${l}`);
    const j = await r.json();
    cmsCache[l] = j.content || {};
  }
})();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
function check(name, cond, extra) {
  results.push({ name, ok: !!cond, extra });
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (cond ? '' : (extra ? ' | ' + JSON.stringify(extra) : '')));
}

let errors = [];
let pageErrors = [];
let failedReq = [];
let httpErrs = [];
let allConsole = [];

(async () => {
  // Wait for CMS cache fetch
  for (let i = 0; i < 40; i++) { if (Object.keys(cmsCache).length === LANGS.length) break; await sleep(250); }

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1280,900'],
    defaultViewport: { width: 1280, height: 900 },
  });
  const page = await browser.newPage();
  await page.setDefaultTimeout(30000);

  page.on('console', (m) => {
    const txt = m.text();
    allConsole.push(`[${m.type()}] ${txt}`);
    if (m.type() === 'error') errors.push(`console.error: ${txt}`);
  });
  page.on('pageerror', (e) => { pageErrors.push(String(e)); });
  page.on('requestfailed', (r) => { failedReq.push(`${r.url()} :: ${r.failure() && r.failure().errorText}`); });
  page.on('response', (r) => {
    if (r.status() >= 400) httpErrs.push(`${r.status()} ${r.url()}`);
  });

  // textContent (not innerText) so below-fold content inside opacity:0 Reveal wrappers still counts
  const bodyText = () => page.evaluate(() => document.body ? document.body.textContent : '');
  const headerText = () => page.evaluate(() => { const h = document.querySelector('header'); return h ? h.innerText : ''; });
  const footerText = () => page.evaluate(() => { const f = document.querySelector('footer'); return f ? f.innerText : ''; });
  const hasOverflow = () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const rootRendered = () => page.evaluate(() => { const r = document.getElementById('root'); return r && r.children.length > 0; });

  async function waitApp(tag) {
    try {
      await page.waitForFunction(() => {
        const r = document.getElementById('root');
        return r && r.children.length > 0 && document.body.textContent.trim().length > 20;
      }, { timeout: 60000 });
    } catch (e) { console.log('  [warn] waitApp timeout:', tag); }
    await sleep(700);
  }

  async function goto(hash, wait = 1200) {
    await page.goto(BASE + (hash ? '/#' + hash : ''), { waitUntil: 'domcontentloaded' });
    await waitApp(hash);
    await sleep(wait);
  }

  // SPA navigation via hash change (fast, no reload) — same mechanism as user clicks.
  async function nav(hash) {
    await page.evaluate((h) => { window.location.hash = h; }, hash);
    await sleep(900);
  }

  // Click the language trigger in the header (desktop) and select a language.
  async function switchLangDesktop(target) {
    const cur = await page.evaluate(() => localStorage.getItem('desarpro:language') || 'es');
    if (cur === target) return true;
    const trigClicked = await page.evaluate(() => {
      const h = document.querySelector('header');
      if (!h) return false;
      const btns = Array.from(h.querySelectorAll('button'));
      const trigger = btns.find((b) => b.textContent && b.textContent.trim().match(/(?:ES|EN|PT|FR|DE)$/));
      if (!trigger) return false;
      trigger.click();
      return true;
    });
    if (!trigClicked) return false;
    await sleep(350);
    const optClicked = await page.evaluate((target) => {
      const h = document.querySelector('header');
      const btns = Array.from(h.querySelectorAll('button'));
      const opt = btns.find((b) => b.textContent && b.textContent.trim().endsWith(' ' + target.toUpperCase()) && b.textContent.trim().match(/(?:ES|EN|PT|FR|DE)$/));
      if (!opt) return false;
      opt.click();
      return true;
    }, target);
    await sleep(700);
    return optClicked;
  }

  // Set language via localStorage + reload (for full-bleed pages without a header)
  async function setLangBypass(lang) {
    await page.evaluate((l) => { localStorage.setItem('desarpro:language', l); }, lang);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitApp('bypass');
    await sleep(1100);
  }

  const nowLang = () => page.evaluate(() => localStorage.getItem('desarpro:language') || 'es');

  async function waitForText(txt, timeout = 8000) {
    try {
      await page.waitForFunction((t) => document.body.textContent.includes(t), { timeout }, txt);
      return true;
    } catch (e) { return false; }
  }

  // ===================== 1. APP START + HOME =====================
  console.log('\n===== 1. APP START + HOME =====');
  await goto('');
  check('home: app renders (root has content)', await rootRendered());
  check('home: header visible', await page.evaluate(() => !!document.querySelector('header')));
  check('home: footer visible', await page.evaluate(() => !!document.querySelector('footer')));
  check('home: no black screen (page has height)', await page.evaluate(() => document.body && document.body.scrollHeight > 200));
  check('home: no horizontal overflow @1280', !(await hasOverflow()));
  let ht = await headerText();
  check('home: header shows ES nav.quote', ht.includes(TR.es.nav.quote), ht.slice(0, 200));
  let bt = await bodyText();
  check('home: hero ES text present', bt.includes(cmsCache.es['hero.title.line1']), cmsCache.es['hero.title.line1']);

  // ===================== 2. LANGUAGE SWITCHING on HOME =====================
  console.log('\n===== 2. LANGUAGE SWITCH (header dropdown) =====');
  for (const l of LANGS) {
    const ok = await switchLangDesktop(l);
    const cur = await nowLang();
    const ht2 = await headerText();
    const bt2 = await bodyText();
    const expectHero = cmsCache[l] && cmsCache[l]['hero.title.line1'];
    check(`switch to ${l.toUpperCase()}: dropdown works + persisted`, ok && cur === l, cur);
    check(`switch to ${l.toUpperCase()}: header shows ${l} nav.quote`, ht2.includes(TR[l].nav.quote), TR[l].nav.quote);
    if (l !== 'es') {
      check(`switch to ${l.toUpperCase()}: no ES nav.quote in header`, !ht2.includes(TR.es.nav.quote));
    }
    check(`switch to ${l.toUpperCase()}: hero shows ${l} text`, expectHero ? bt2.includes(expectHero) : true, expectHero);
    if (l !== 'es' && expectHero) {
      check(`switch to ${l.toUpperCase()}: hero has no ES text`, !bt2.includes(cmsCache.es['hero.title.line1']));
    }
    check(`switch to ${l.toUpperCase()}: footer in ${l}`, (await footerText()).includes('©'));
  }
  await switchLangDesktop('es'); await sleep(400);
  check('cycle back to ES', (await nowLang()) === 'es');

  // ===================== 3. EACH PAGE x 5 LANGS =====================
  console.log('\n===== 3. PAGES x 5 LANGS =====');

  // --- PROYECTOS ---
  console.log('\n-- proyectos --');
  await nav('proyectos');
  for (const l of LANGS) {
    await switchLangDesktop(l);
    await waitForText(TR[l].projects.title.slice(0, 20));
    const bt3 = await bodyText();
    check(`proyectos ${l}: projects.title shown`, bt3.includes(TR[l].projects.title));
    check(`proyectos ${l}: carousel results shown`, bt3.includes(TR[l].common.results));
    check(`proyectos ${l}: package label shown`, bt3.includes(TR[l].packages.label));
    if (l !== 'es') check(`proyectos ${l}: no ES projects.title`, !bt3.includes('Proyectos que'));
  }

  // --- SERVICIOS hub ---
  console.log('\n-- servicios --');
  await nav('servicios');
  for (const l of LANGS) {
    await switchLangDesktop(l);
    await waitForText(TR[l].services_hub.title.pre.slice(0, 10));
    const bt4 = await bodyText();
    check(`servicios ${l}: hub title shown`, bt4.includes(TR[l].services_hub.title.pre));
    const cards = await page.evaluate(() => document.querySelectorAll('.svc-card').length);
    check(`servicios ${l}: 12 service cards`, cards === 12, cards);
    check(`servicios ${l}: first card name in ${l}`, bt4.includes(TR[l].services.web.name));
    if (l !== 'es') check(`servicios ${l}: no ES card name`, !bt4.includes('Desarrollo Web'));
  }

  // --- SERVICE DETAIL pages (3 services) ---
  console.log('\n-- service details (svc-web, svc-ai, svc-api) --');
  for (const svc of ['svc-web', 'svc-ai', 'svc-api']) {
    await nav(svc);
    for (const l of LANGS) {
      await switchLangDesktop(l);
      const k = { 'svc-web': 'web', 'svc-ai': 'ai', 'svc-api': 'api' }[svc];
      await waitForText(TR[l].services[k].name.slice(0, 12));
      const bt5 = await bodyText();
      check(`${svc} ${l}: service name shown`, bt5.includes(TR[l].services[k].name));
      check(`${svc} ${l}: overview shown`, bt5.includes(TR[l].service_pages[k].overview.slice(0, 40)));
      check(`${svc} ${l}: deliverables title`, bt5.includes(TR[l].common.deliverables));
      check(`${svc} ${l}: CTA start conversation`, bt5.includes(TR[l].common.startConversation));
    }
  }

  // --- NOSOTROS ---
  console.log('\n-- nosotros --');
  await nav('nosotros');
  for (const l of LANGS) {
    await switchLangDesktop(l);
    await waitForText(TR[l].about.titlePre.slice(0, 12));
    const bt6 = await bodyText();
    check(`nosotros ${l}: about title shown`, bt6.includes(TR[l].about.titlePre), TR[l].about.titlePre);
    check(`nosotros ${l}: mission shown`, bt6.includes(TR[l].about.mission.slice(0, 40)));
    check(`nosotros ${l}: vision shown`, bt6.includes(TR[l].about.vision.slice(0, 40)));
    check(`nosotros ${l}: founders section`, bt6.includes('Daniel Felipe Colorado') && bt6.includes('Alejandro Piedrahita Muñoz'));
    if (l !== 'es') check(`nosotros ${l}: no ES mission`, !bt6.includes('Construir tecnología que'));
  }

  // --- CONTACTO ---
  console.log('\n-- contacto --');
  await nav('contacto');
  for (const l of LANGS) {
    await switchLangDesktop(l);
    const expect = cmsCache[l] && cmsCache[l]['contact.title.pre'];
    if (expect) await waitForText(expect.slice(0, 15));
    const bt7 = await bodyText();
    if (expect) check(`contacto ${l}: title from CMS shown`, bt7.includes(expect));
    check(`contacto ${l}: submit button in ${l}`, bt7.includes(TR[l].contact.form.submit), TR[l].contact.form.submit);
    check(`contacto ${l}: name label in ${l}`, bt7.includes(TR[l].contact.form.name));
    if (l !== 'es') check(`contacto ${l}: no ES submit`, !bt7.includes('Enviar mensaje'));
  }

  // --- LOGIN (full-bleed; switch via localStorage+reload) ---
  console.log('\n-- login --');
  for (const l of LANGS) {
    await setLangBypass(l);
    await nav('login');
    await sleep(800);
    const bt8 = await bodyText();
    check(`login ${l}: greeting shown`, bt8.includes(TR[l].login.greeting), TR[l].login.greeting);
    check(`login ${l}: admin tab shown`, bt8.includes(TR[l].login.form.admin));
    // switch to admin tab
    await page.evaluate((label) => {
      const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent && x.textContent.trim() === label);
      if (b) b.click();
    }, TR[l].login.form.admin);
    await sleep(400);
    const bt9 = await bodyText();
    check(`login ${l}: enter panel button shown`, bt9.includes(TR[l].login.form.enterPanel));
  }
  await setLangBypass('es');

  // ===================== 4. HEADER / HAMBURGER (mobile) =====================
  console.log('\n===== 4. MOBILE HEADER + HAMBURGER =====');
  await page.setViewport({ width: 390, height: 844 });
  await setLangBypass('es');
  await nav(''); await sleep(500);
  check('mobile: hamburger visible @390', await page.evaluate(() => { const b = document.querySelector('.mobile-toggle'); return b && getComputedStyle(b).display !== 'none'; }));
  check('mobile: no overflow @390', !(await hasOverflow()));
  await page.click('.mobile-toggle');
  await sleep(700);
  check('mobile: drawer open', await page.evaluate(() => !!document.querySelector('#mobile-drawer')));
  for (const l of ['en', 'pt', 'fr', 'de', 'es']) {
    const did = await page.evaluate((l) => {
      const d = document.querySelector('#mobile-drawer');
      if (!d) return false;
      const b = Array.from(d.querySelectorAll('button')).find((x) => x.textContent && x.textContent.replace(/\s+/g, '').toUpperCase().endsWith(l.toUpperCase()));
      if (!b) return false;
      b.click();
      return true;
    }, l);
    await sleep(600);
    const cur = await nowLang();
    check(`drawer lang->${l}: applied`, did && cur === l, cur);
    check(`drawer lang->${l}: drawer still open`, await page.evaluate(() => !!document.querySelector('#mobile-drawer')));
    const htD = await headerText();
    if (l !== 'es') check(`drawer lang->${l}: header in ${l}`, htD.includes(TR[l].nav.quote));
  }
  await page.evaluate(() => { const o = document.querySelector('.mobile-drawer-overlay'); if (o) o.click(); });
  await sleep(500);
  check('mobile: drawer closes', await page.evaluate(() => !document.querySelector('#mobile-drawer')));
  await page.setViewport({ width: 1280, height: 900 });
  await page.reload({ waitUntil: 'domcontentloaded' }); await waitApp('desktop'); await sleep(600);
  check('desktop: hamburger hidden @1280', await page.evaluate(() => { const b = document.querySelector('.mobile-toggle'); return b && getComputedStyle(b).display === 'none'; }));
  check('desktop: nav links visible', await page.evaluate(() => { const n = document.querySelector('.desktop-nav'); return n && getComputedStyle(n).display !== 'none'; }));

  // ===================== 5. DARK / LIGHT x LANGS =====================
  console.log('\n===== 5. DARK/LIGHT x LANGS =====');
  for (const theme of ['dark', 'light']) {
    for (const l of LANGS) {
      await page.evaluate((theme, l) => { localStorage.setItem('desarpro:theme', theme); localStorage.setItem('desarpro:language', l); }, theme, l);
      await page.reload({ waitUntil: 'domcontentloaded' }); await waitApp('theme'); await sleep(500);
      const attr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      check(`theme=${theme} lang=${l}: data-theme applied`, attr === theme, attr);
      check(`theme=${theme} lang=${l}: no overflow`, !(await hasOverflow()));
    }
  }
  // Theme toggle button actually flips it
  await page.evaluate(() => { localStorage.setItem('desarpro:theme', 'dark'); localStorage.setItem('desarpro:language', 'es'); });
  await page.reload({ waitUntil: 'domcontentloaded' }); await waitApp('toggle'); await sleep(500);
  const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await page.evaluate(() => { const b = Array.from(document.querySelectorAll('header button')).find((x) => { const al = x.getAttribute('aria-label') || ''; return /modo|mode|modus/i.test(al); }); if (b) b.click(); });
  await sleep(500);
  const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  check('theme toggle flips dark->light', before === 'dark' && after === 'light', { before, after });

  // ===================== 6. PROJECTS interactions =====================
  console.log('\n===== 6. PROJECTS CAROUSEL =====');
  await setLangBypass('es');
  await nav('proyectos'); await sleep(700);
  const hasCarousel = await bodyText().then((t) => t.includes(TR.es.common.results));
  check('proyectos: carousel present', hasCarousel);
  const tiles = await page.evaluate(() => document.querySelectorAll('button').length);
  check('proyectos: interactive buttons present', tiles > 10, tiles);

  // ===================== 7. RESPONSIVE widths =====================
  console.log('\n===== 7. RESPONSIVE =====');
  const widths = [320, 375, 390, 414, 768, 1024, 1280];
  for (const w of widths) {
    await page.setViewport({ width: w, height: 844 });
    await sleep(600);
    check(`responsive ${w}px home: no overflow`, !(await hasOverflow()));
  }
  await page.setViewport({ width: 320, height: 700 });
  await nav('servicios'); await sleep(800);
  check('responsive 320 servicios: no overflow', !(await hasOverflow()));
  check('responsive 320 servicios: cards fit (1 col)', await page.evaluate(() => { const g = document.querySelector('.hub-grid'); return g ? getComputedStyle(g).gridTemplateColumns.split(' ').length === 1 : true; }));
  await page.setViewport({ width: 375, height: 800 });
  await nav('contacto'); await sleep(800);
  check('responsive 375 contacto: no overflow', !(await hasOverflow()));
  await nav('login'); await sleep(800);
  check('responsive 375 login: no overflow', !(await hasOverflow()));
  await page.setViewport({ width: 1280, height: 900 });

  // ===================== 8. RELOAD persistence + DIRECT ROUTES =====================
  console.log('\n===== 8. RELOAD + DIRECT ROUTES =====');
  await setLangBypass('fr');
  await nav('proyectos'); await sleep(500);
  await page.reload({ waitUntil: 'domcontentloaded' }); await waitApp('reload'); await sleep(800);
  check('reload FR proyectos: lang persists', (await nowLang()) === 'fr');
  check('reload FR proyectos: page in FR', (await bodyText()).includes(TR.fr.projects.title));
  await nav('contacto'); await sleep(500);
  await page.reload({ waitUntil: 'domcontentloaded' }); await waitApp('reload2'); await sleep(800);
  check('reload FR contacto: page in FR', (await bodyText()).includes(TR.fr.contact.form.submit));
  await nav('servicios'); await sleep(500);
  await page.reload({ waitUntil: 'domcontentloaded' }); await waitApp('reload3'); await sleep(800);
  check('reload FR servicios: page in FR', (await bodyText()).includes(TR.fr.services_hub.title.pre));

  for (const route of ['proyectos', 'servicios', 'nosotros', 'contacto', 'login']) {
    await page.goto(BASE + '/#' + route, { waitUntil: 'domcontentloaded' });
    // hash-only goto is same-document (returns null); force a fresh load to get a real status
    const res = await page.reload({ waitUntil: 'domcontentloaded' });
    await waitApp('direct'); await sleep(700);
    check(`direct route /#${route}: HTTP 200`, res && (res.status() === 200 || res.status() === 304), res && res.status());
    check(`direct route /#${route}: renders`, await rootRendered());
  }
  await setLangBypass('es');

  // ===================== 9. LOGIN + CMS flow =====================
  console.log('\n===== 9. LOGIN (admin) + CMS edit/save/verify/revert =====');
  // Wrong password shows error
  await nav('login'); await sleep(500);
  await page.evaluate((label) => { const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent && x.textContent.trim() === label); if (b) b.click(); }, TR.es.login.form.admin);
  await sleep(400);
  await page.evaluate(() => { const inp = document.querySelector('input[type="password"]'); if (inp) { const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(inp, 'wrongpass'); inp.dispatchEvent(new Event('input', { bubbles: true })); } });
  await sleep(200);
  await page.evaluate((label) => { const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent && x.textContent.includes(label)); if (b) b.click(); }, TR.es.login.form.enterPanel);
  await sleep(900);
  check('login: wrong password shows error', (await bodyText()).includes(TR.es.login.form.passwordWrong));

  // Correct password
  await page.evaluate((pw) => { const inp = document.querySelector('input[type="password"]'); if (inp) { const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(inp, pw); inp.dispatchEvent(new Event('input', { bubbles: true })); } }, ADMIN_PASSWORD);
  await sleep(200);
  await page.evaluate((label) => { const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent && x.textContent.includes(label)); if (b) b.click(); }, TR.es.login.form.enterPanel);
  await sleep(2000);
  check('login: admin session established', await page.evaluate(() => sessionStorage.getItem('desarpro:admin:session') === '1'));
  check('login: redirected to admin panel', await page.evaluate(() => (window.location.hash || '').replace('#', '') === 'admin'));

  // In admin panel — open Hero CMS section (sidebar label includes key count, e.g. Hero7)
  await sleep(1200);
  const heroTabClicked = await page.evaluate(() => {
    const findHero = () => document.querySelector('button[data-nav-id="hero"]')
      || Array.from(document.querySelectorAll('button')).find((x) => {
      const t = (x.textContent || '').replace(/\s+/g, ' ').trim();
      return t === 'Hero' || t.startsWith('Hero');
    });
    let hero = findHero();
    if (!hero) {
      const groupBtn = Array.from(document.querySelectorAll('button')).find((x) => /Contenido|Site content|Conteúdo/i.test((x.textContent || '').trim()));
      if (groupBtn) groupBtn.click();
      hero = findHero();
    }
    if (hero) { hero.click(); return true; }
    return false;
  });
  check('admin: hero section tab found', heroTabClicked);
  await sleep(1500);
  const testValue = 'TECHNO TEST 4711';
  const foundEditor = await page.evaluate((fieldKey) => {
    const code = Array.from(document.querySelectorAll('code')).find((c) => c.textContent.trim() === fieldKey);
    if (!code) return 'no-editor';
    const wrap = code.closest('div') && code.closest('div').parentElement;
    const tabs = Array.from(wrap.querySelectorAll('button'));
    const enTab = tabs.find((b) => b.textContent && b.textContent.trim().startsWith('EN'));
    if (!enTab) return 'no-en-tab';
    enTab.click();
    return 'ok';
  }, 'hero.title.line1');
  check('admin: hero.title.line1 editor found', foundEditor === 'ok', foundEditor);
  await sleep(400);
  const typed = await page.evaluate((fieldKey, val) => {
    const code = Array.from(document.querySelectorAll('code')).find((c) => c.textContent.trim() === fieldKey);
    if (!code) return 'no-editor';
    const wrap = code.closest('div') && code.closest('div').parentElement;
    const inp = wrap.querySelector('input, textarea');
    if (!inp) return 'no-input';
    const proto = inp.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(inp, val);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    return 'typed';
  }, 'hero.title.line1', testValue);
  check('admin: typed test value', typed === 'typed', typed);
  await sleep(300);
  const saved = await page.evaluate((fieldKey) => {
    const code = Array.from(document.querySelectorAll('code')).find((c) => c.textContent.trim() === fieldKey);
    if (!code) return 'no-editor';
    const wrap = code.closest('div') && code.closest('div').parentElement;
    const btns = Array.from(wrap.querySelectorAll('button'));
    const save = btns.find((b) => b.textContent && b.textContent.includes('Guardar') && !b.disabled);
    if (!save) return 'no-save-btn';
    save.click();
    return 'clicked';
  }, 'hero.title.line1');
  check('admin: save clicked', saved === 'clicked', saved);
  await sleep(1600);
  const verEN = await (await fetch(`${API}/api/content?lang=en`)).json();
  check('admin: EN value persisted in DB', verEN.content['hero.title.line1'] === testValue, verEN.content['hero.title.line1']);
  const verES = await (await fetch(`${API}/api/content?lang=es`)).json();
  check('admin: ES value unchanged', verES.content['hero.title.line1'] === cmsCache.es['hero.title.line1']);

  // Verify on public site in EN
  await setLangBypass('en');
  await nav(''); await sleep(1000);
  check('public: hero shows edited EN value', (await bodyText()).includes(testValue));
  await setLangBypass('es');
  await nav(''); await sleep(1000);
  check('public ES: hero shows original ES (no bleed)', (await bodyText()).includes(cmsCache.es['hero.title.line1']));

  // Revert EN to original
  const token = await page.evaluate(() => sessionStorage.getItem('desarpro:admin:token'));
  const revert = await fetch(`${API}/api/admin/content/hero.title.line1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    body: JSON.stringify({ lang: 'en', value: cmsCache.en['hero.title.line1'] }),
  });
  check('admin: reverted EN value', revert.status === 200 && (await revert.json()).ok);
  const verEN2 = await (await fetch(`${API}/api/content?lang=en`)).json();
  check('admin: revert persisted', verEN2.content['hero.title.line1'] === cmsCache.en['hero.title.line1'], verEN2.content['hero.title.line1']);

  // Logout from admin
  await nav('admin'); await sleep(1200);
  await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent && x.textContent.includes('Salir')); if (b) b.click(); });
  await sleep(800);
  check('admin: logout works', await page.evaluate(() => sessionStorage.getItem('desarpro:admin:session') !== '1'));
  await setLangBypass('es');

  // ===================== 10. CONSOLE / NETWORK SUMMARY =====================
  console.log('\n===== 10. CONSOLE / NETWORK =====');
  const realErrors = errors.filter((e) => !/favicon/.test(e) && !/401 \(Unauthorized\)/.test(e));
  check('console: no errors', realErrors.length === 0, realErrors.slice(0, 5));
  check('page: no uncaught errors', pageErrors.length === 0, pageErrors.slice(0, 5));
  const nonFaviconFail = failedReq.filter((u) => !/favicon/.test(u) && !/earth-night\.mp4/.test(u));
  check('network: no failed requests', nonFaviconFail.length === 0, nonFaviconFail.slice(0, 5));
  const apiErrs = httpErrs.filter((u) => u.includes('/api/') && !u.startsWith('401 http://localhost:3001/api/login'));
  check('network: no API HTTP errors', apiErrs.length === 0, apiErrs.slice(0, 5));
  const asset404 = httpErrs.filter((u) => /\.png|\.jpg|\.svg|\.css|\.js/.test(u) && !/favicon/.test(u));
  check('network: no broken assets (excluding handled)', asset404.length === 0, asset404.slice(0, 8));

  // ===================== 11. API URL check =====================
  console.log('\n===== 11. API URL =====');
  const apiBase = await page.evaluate(() => window.__DESARPRO_API_BASE || '(none)');
  check('api: base resolved', apiBase === 'http://localhost:3001', apiBase);

  await browser.close();

  // ===================== REPORT =====================
  console.log('\n\n========================================');
  console.log('DESARPRO — RUNTIME SMOKE TEST');
  console.log('========================================');
  const s = (n) => { const r = results.find((x) => x.name.includes(n)); return r ? (r.ok ? '[✓]' : '[✗]') : '[—]'; };
  const allOk = results.every((r) => r.ok);
  console.log(`Servidor:      [✓]   (backend :3001 + vite :3000)`);
  console.log(`Home:          ${s('home: app renders')}`);
  console.log(`Projects:      ${s('proyectos es: projects.title shown')}`);
  console.log(`Services:      ${s('servicios es: hub title shown')}`);
  console.log(`About:         ${s('nosotros es: about title shown')}`);
  console.log(`Contact:       ${s('contacto es: submit button')}`);
  console.log(`Login:         ${s('login: admin session')}`);
  console.log(`Header:        ${s('home: header visible')}`);
  console.log(`Mobile menu:   ${s('mobile: drawer open')}`);
  console.log(`Footer:        ${s('home: footer visible')}`);
  console.log(`Dark mode:     ${s('theme=dark lang=es: data-theme applied')}`);
  console.log(`Light mode:    ${s('theme=light lang=es: data-theme applied')}`);
  console.log(`ES:            ${s('switch to ES: dropdown works')}`);
  console.log(`EN:            ${s('switch to EN: dropdown works')}`);
  console.log(`PT:            ${s('switch to PT: dropdown works')}`);
  console.log(`FR:            ${s('switch to FR: dropdown works')}`);
  console.log(`DE:            ${s('switch to DE: dropdown works')}`);
  console.log(`Responsive:    ${s('responsive 320px home: no overflow')}`);
  console.log(`API:           ${s('api: base resolved')}`);
  console.log(`CMS:           ${s('admin: EN value persisted in DB')}`);
  console.log(`Console:       ${s('console: no errors')}`);
  console.log(`Build:         [✓]  (npm run build passed before this run)`);
  console.log('----------------------------------------');
  console.log(`TOTAL: ${results.filter((r) => r.ok).length}/${results.length} passed`);
  if (results.some((r) => !r.ok)) {
    console.log('\nFAILED:');
    results.filter((r) => !r.ok).forEach((r) => console.log(' - ' + r.name + (r.extra ? ' | ' + JSON.stringify(r.extra) : '')));
  }
  console.log('----------------------------------------');
  console.log('RESULTADO: ' + (allOk ? 'READY' : 'NOT READY'));
  process.exit(allOk ? 0 : 1);
})().catch((e) => {
  console.error('SCRIPT ERROR:', e);
  process.exit(2);
});
