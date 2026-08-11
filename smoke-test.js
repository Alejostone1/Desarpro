const { spawn } = require('child_process');

const PORT = 3101;
const BASE = `http://localhost:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(opts.token ? { 'x-admin-token': opts.token } : {}), ...(opts.headers || {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch (e) {}
  return { status: res.status, data };
}

(async () => {
  const server = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', (d) => process.stdout.write('[srv] ' + d.toString()));
  server.stderr.on('data', (d) => process.stdout.write('[srv-err] ' + d.toString()));

  const results = [];
  const check = (name, cond, extra) => {
    results.push({ name, ok: !!cond, extra });
    console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (cond ? '' : ' | ' + JSON.stringify(extra)));
  };

  try {
    // Wait for server
    let healthy = false;
    for (let i = 0; i < 20; i++) {
      try { const r = await fetch(BASE + '/api/health'); if (r.ok) { healthy = true; break; } } catch (e) {}
      await sleep(300);
    }
    check('health endpoint', healthy);

    // Login (wrong password)
    const bad = await req('/api/login', { method: 'POST', body: { email: 'admin@desarpro.com', password: 'wrong' } });
    check('login wrong password -> 401', bad.status === 401);

    // Login (correct)
    const login = await req('/api/login', { method: 'POST', body: { email: 'admin@desarpro.com', password: 'Administrador01' } });
    check('login ok -> token', login.status === 200 && !!login.data.token, login.data);
    const token = login.data && login.data.token;

    // Public content (EN)
    const en = await req('/api/content?lang=en');
    check('content en', en.status === 200 && en.data.content['hero.title.line1'] === 'Technology that', en.data && en.data.content && en.data.content['hero.title.line1']);

    // Public content (DE)
    const de = await req('/api/content?lang=de');
    check('content de', de.status === 200 && !!de.data.content['about.mission'], de.data && de.data.content && de.data.content['about.mission']);

    // Admin content list
    const admin = await req('/api/admin/content', { token });
    check('admin content list (84 keys)', admin.status === 200 && Array.isArray(admin.data.content) && admin.data.content.length === 84, admin.data && admin.data.content && admin.data.content.length);

    // Security: write without token -> 401
    const noAuth = await req('/api/admin/content/hero.title.line1', { method: 'PUT', body: { lang: 'de', value: 'X' } });
    check('security: PUT without token -> 401', noAuth.status === 401, noAuth.status);

    // Security: write with token, invalid lang -> 400
    const badLang = await req('/api/admin/content/hero.title.line1', { method: 'PUT', token, body: { lang: 'xx', value: 'X' } });
    check('PUT invalid lang -> 400', badLang.status === 400, badLang.status);

    // Save a value (DE), read it back
    const save = await req('/api/admin/content/hero.title.line1', { method: 'PUT', token, body: { lang: 'de', value: 'Technologie, die (test)' } });
    check('PUT content ok', save.status === 200 && save.data.ok, save.data);
    const deAfter = await req('/api/content?lang=de');
    check('DB persisted value', deAfter.data.content['hero.title.line1'] === 'Technologie, die (test)', deAfter.data && deAfter.data.content && deAfter.data.content['hero.title.line1']);

    // Restore seed value
    await req('/api/admin/content/hero.title.line1', { method: 'PUT', token, body: { lang: 'de', value: 'Technologie, die' } });

    // Bulk save (all langs) for a key
    const bulk = await req('/api/admin/content', { method: 'PUT', token, body: { key: 'cta.title', translations: { es: '¿Listos?', en: 'Ready?' } } });
    check('PUT bulk content ok', bulk.status === 200 && bulk.data.ok, bulk.data);
    const enCta = await req('/api/content?lang=en');
    check('bulk saved EN', enCta.data.content['cta.title'] === 'Ready?', enCta.data && enCta.data.content && enCta.data.content['cta.title']);

    // Projects public (EN -> fallback to ES titles since no translations)
    const projs = await req('/api/projects?lang=en');
    check('public projects (active)', projs.status === 200 && Array.isArray(projs.data.projects) && projs.data.projects.length === 10, projs.data && projs.data.projects && projs.data.projects.length);

    // Admin projects include translations + inactive
    const adminProjs = await req('/api/admin/projects', { token });
    const p0 = adminProjs.data && adminProjs.data.projects && adminProjs.data.projects[0];
    check('admin projects include translations', adminProjs.status === 200 && p0 && !!p0.translations && !!p0.translations.es, p0 && p0.slug);

    // Export
    const exp = await req('/api/admin/content/export', { token });
    check('export ok', exp.status === 200 && exp.data.content && exp.data.projects && Object.keys(exp.data.content).length === 84, exp.data && Object.keys(exp.data.content || {}).length);

    // Import (restore the export — idempotent)
    const imp = await req('/api/admin/content/import', { method: 'POST', token, body: { content: exp.data.content, projects: exp.data.projects } });
    check('import ok', imp.status === 200 && imp.data.imported && imp.data.imported.content === 84, imp.data);

    // Import invalid -> no DB change, 400
    const badImport = await req('/api/admin/content/import', { method: 'POST', token, body: { content: { 'bad key': { es: 123 } } } });
    check('import invalid -> 400', badImport.status === 400, badImport.status);

    // Reset
    const reset = await req('/api/admin/content/reset', { method: 'POST', token });
    check('reset ok', reset.status === 200 && reset.data.ok, reset.data);
    const deReset = await req('/api/content?lang=de');
    check('reset restored DE', deReset.data.content['hero.title.line1'] === 'Technologie, die', deReset.data && deReset.data.content && deReset.data.content['hero.title.line1']);
  } catch (e) {
    console.error('TEST ERROR:', e.message);
  } finally {
    server.kill();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\nRESULTADO: ${results.length - failed.length}/${results.length} pasaron`);
  process.exit(failed.length ? 1 : 0);
})();
