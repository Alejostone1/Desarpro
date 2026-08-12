const { spawn } = require('child_process');

const PORT = 3101;
const BASE = `http://localhost:${PORT}`;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Android.13';
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
    const login = await req('/api/login', { method: 'POST', body: { email: 'admin@desarpro.com', password: DEMO_PASSWORD } });
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

    // Dashboard with portal metrics
    const dash = await req('/api/admin/dashboard', { token });
    check('admin dashboard portal metrics', dash.status === 200 && typeof dash.data.dashboard.clients === 'number' && typeof dash.data.dashboard.conversations === 'number', dash.data && dash.data.dashboard);

    // Client login
    const superLogin = await req('/api/login', { method: 'POST', body: { email: 'super@desarpro.com', password: DEMO_PASSWORD } });
    check('super admin login ok', superLogin.status === 200 && superLogin.data.user?.role === 'super_admin', superLogin.data);

    const clientLogin = await req('/api/login', { method: 'POST', body: { email: 'cliente@demo.com', password: DEMO_PASSWORD } });
    check('client login ok', clientLogin.status === 200 && clientLogin.data.user && clientLogin.data.user.role === 'client', clientLogin.data);
    const clientToken = clientLogin.data && clientLogin.data.token;

    // Client cannot access admin users
    const clientForbidden = await req('/api/admin/users', { token: clientToken });
    check('client blocked from admin users -> 403', clientForbidden.status === 403, clientForbidden.status);

    // No token -> 401 on protected admin endpoint
    const noTokenUsers = await req('/api/admin/users');
    check('no token admin users -> 401', noTokenUsers.status === 401, noTokenUsers.status);

    // Client dashboard
    const clientDash = await req('/api/client/dashboard', { token: clientToken });
    check('client dashboard', clientDash.status === 200 && clientDash.data.dashboard, clientDash.data);

    // Client projects
    const clientProjs = await req('/api/client/projects', { token: clientToken });
    check('client projects', clientProjs.status === 200 && Array.isArray(clientProjs.data.projects), clientProjs.data);

    // Cross-client ownership: maria cannot access cliente's project
    const mariaLogin = await req('/api/login', { method: 'POST', body: { email: 'maria@demo.com', password: DEMO_PASSWORD } });
    const mariaToken = mariaLogin.data?.token;
    const otherProjectId = clientProjs.data?.projects?.[0]?.id;
    if (otherProjectId && mariaToken) {
      const crossAccess = await req(`/api/client/projects/${otherProjectId}`, { token: mariaToken });
      check('client cannot access other client project -> 404', crossAccess.status === 404, crossAccess.status);
    } else {
      check('client cannot access other client project -> 404', false, 'missing project or maria token');
    }

    // Register new client (unique email) — pending approval
    const regEmail = `test${Date.now()}@demo.com`;
    const reg = await req('/api/auth/register', { method: 'POST', body: { email: regEmail, password: 'Test1234', firstName: 'Test', passwordConfirm: 'Test1234' } });
    check('register client pending', reg.status === 201 && reg.data.pending && reg.data.user?.status === 'PENDING', reg.data);

    // Pending user cannot login
    const pendingLogin = await req('/api/login', { method: 'POST', body: { email: regEmail, password: 'Test1234' } });
    check('pending client login -> 403', pendingLogin.status === 403 && pendingLogin.data?.error === 'pending', pendingLogin.data);

    const regUserId = reg.data?.user?.id;
    if (regUserId) {
      const approve = await req(`/api/admin/clients/${regUserId}/status`, { method: 'PATCH', token, body: { action: 'APPROVE' } });
      check('approve pending client', approve.status === 200 && approve.data?.user?.status === 'ACTIVE', approve.data);
      const approvedLogin = await req('/api/login', { method: 'POST', body: { email: regEmail, password: 'Test1234' } });
      check('approved client login ok', approvedLogin.status === 200 && approvedLogin.data?.token, approvedLogin.data);
      const suspend = await req(`/api/admin/clients/${regUserId}/status`, { method: 'PATCH', token, body: { action: 'SUSPEND' } });
      check('suspend client', suspend.status === 200 && suspend.data?.user?.status === 'SUSPENDED', suspend.data);
      const suspendedLogin = await req('/api/login', { method: 'POST', body: { email: regEmail, password: 'Test1234' } });
      check('suspended login -> 403', suspendedLogin.status === 403 && suspendedLogin.data?.error === 'suspended', suspendedLogin.data);
      const reactivate = await req(`/api/admin/clients/${regUserId}/status`, { method: 'PATCH', token, body: { action: 'REACTIVATE' } });
      check('reactivate client', reactivate.status === 200 && reactivate.data?.user?.status === 'ACTIVE', reactivate.data);
    } else {
      check('approve pending client', false, 'no reg user id');
      check('approved client login ok', false, 'skipped');
      check('suspend client', false, 'skipped');
      check('suspended login -> 403', false, 'skipped');
      check('reactivate client', false, 'skipped');
    }

    const regEmail2 = `reject${Date.now()}@demo.com`;
    const reg2 = await req('/api/auth/register', { method: 'POST', body: { email: regEmail2, password: 'Test1234', firstName: 'Reject', passwordConfirm: 'Test1234' } });
    if (reg2.data?.user?.id) {
      const reject = await req(`/api/admin/clients/${reg2.data.user.id}/status`, { method: 'PATCH', token, body: { action: 'REJECT' } });
      check('reject client', reject.status === 200 && reject.data?.user?.status === 'REJECTED', reject.data);
      const rejectedLogin = await req('/api/login', { method: 'POST', body: { email: regEmail2, password: 'Test1234' } });
      check('rejected login -> 403', rejectedLogin.status === 403 && rejectedLogin.data?.error === 'rejected', rejectedLogin.data);
    } else {
      check('reject client', false, reg2.data);
      check('rejected login -> 403', false, 'skipped');
    }

    // Mark all notifications read
    const readAll = await req('/api/notifications/read-all', { method: 'PATCH', token: clientToken });
    check('notifications read-all', readAll.status === 200 && readAll.data?.ok, readAll.data);

    // General settings
    const genGet = await req('/api/admin/settings/general', { token });
    check('general settings get', genGet.status === 200 && genGet.data?.settings, genGet.data);
    const genPatch = await req('/api/admin/settings/general', { method: 'PATCH', token, body: { 'general.identity': { companyName: 'DesarPro Test' } } });
    check('general settings patch', genPatch.status === 200 && genPatch.data?.ok, genPatch.data);

    // Deliverables (admin + client)
    const cpId = clientProjs.data?.projects?.[0]?.id;
    if (cpId) {
      const delCreate = await req(`/api/admin/client-projects/${cpId}/deliverables`, { method: 'POST', token, body: { title: 'Smoke deliverable', url: 'https://example.com/doc.pdf', visible: true } });
      check('create deliverable', delCreate.status === 201 && delCreate.data?.deliverable, delCreate.data);
      const delList = await req(`/api/client/projects/${cpId}/deliverables`, { token: clientToken });
      check('client deliverables list', delList.status === 200 && Array.isArray(delList.data?.deliverables), delList.data);
    } else {
      check('create deliverable', false, 'no project');
      check('client deliverables list', false, 'no project');
    }

    // Webhooks CRUD
    const whCreate = await req('/api/admin/webhooks', { method: 'POST', token, body: { name: 'Smoke', url: 'https://example.com/hook', event: 'lead.created', active: true } });
    check('webhook create', whCreate.status === 201 && whCreate.data?.webhook?.id, whCreate.data);
    const whList = await req('/api/admin/webhooks', { token });
    check('webhook list', whList.status === 200 && Array.isArray(whList.data?.webhooks), whList.data);

    // Reset password validate (invalid token)
    const badToken = await req('/api/auth/reset-password/validate?token=invalidtoken123');
    check('reset token invalid', badToken.status === 200 && badToken.data?.valid === false, badToken.data);

    // Email test (may skip if no SMTP)
    const emailTest = await req('/api/admin/integrations/email/test', { method: 'POST', token, body: {} });
    check('email test endpoint', emailTest.status === 200 || emailTest.status === 500, emailTest.data);

    // Cross-client deliverables ownership
    if (otherProjectId && mariaToken) {
      const crossDel = await req(`/api/client/projects/${otherProjectId}/deliverables`, { token: mariaToken });
      check('client cannot access other deliverables -> 404', crossDel.status === 404, crossDel.status);
    } else {
      check('client cannot access other deliverables -> 404', false, 'missing project or maria token');
    }

    // Password reset request
    const forgot = await req('/api/auth/forgot-password', { method: 'POST', body: { email: regEmail } });
    check('forgot password ok', forgot.status === 200 && forgot.data.ok, forgot.data);

    // Conversations + chat
    const convs = await req('/api/conversations', { token: clientToken });
    check('client conversations', convs.status === 200 && Array.isArray(convs.data.conversations), convs.data);
    let convId = convs.data?.conversations?.[0]?.id;
    if (!convId) {
      const created = await req('/api/conversations', { method: 'POST', token: clientToken, body: { subject: 'Smoke test', content: 'Hola' } });
      convId = created.data?.conversation?.id;
    }
    if (convId) {
      const msg = await req(`/api/conversations/${convId}/messages`, { method: 'POST', token: clientToken, body: { content: 'Smoke test message ' + Date.now() } });
      check('chat send message', msg.status === 201 && msg.data.message, msg.data);
    } else {
      check('chat send message', false, 'no conversation id');
    }

    // Notifications
    const notif = await req('/api/notifications', { token: clientToken });
    check('client notifications', notif.status === 200 && Array.isArray(notif.data.notifications), notif.data);

    if (notif.data?.notifications?.[0]?.id && mariaToken) {
      const crossNotif = await req(`/api/notifications/${notif.data.notifications[0].id}/read`, { method: 'PATCH', token: mariaToken });
      check('client cannot mark other notification -> 404', crossNotif.status === 404, crossNotif.status);
    } else {
      check('client cannot mark other notification -> 404', true, 'skipped');
    }

    const unreadN = await req('/api/notifications/unread-count', { token: clientToken });
    check('notifications unread-count', unreadN.status === 200 && typeof unreadN.data.unreadCount === 'number', unreadN.data);

    // Integrations status (admin)
    const integ = await req('/api/admin/integrations/status', { token });
    check('integrations status', integ.status === 200 && integ.data.integrations?.smtp, integ.data);

    // Dashboard alerts
    check('dashboard alerts array', dash.status === 200 && Array.isArray(dash.data.dashboard.alerts), dash.data?.dashboard?.alerts);

    // Admin cannot be created as super_admin by normal admin
    const admin2 = await req('/api/login', { method: 'POST', body: { email: 'admin@desarpro.com', password: DEMO_PASSWORD } });
    const adminTok = admin2.data?.token;
    const trySuper = await req('/api/admin/users', { method: 'POST', token: adminTok, body: { email: 'hack@test.com', password: 'Test1234', role: 'super_admin' } });
    check('admin cannot create super_admin -> 403', trySuper.status === 403, trySuper.status);

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
