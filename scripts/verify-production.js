/** Verificación post-deploy producción — sin logins repetidos. */
const API = process.env.PROD_API || 'https://desarpro-production.up.railway.app';
const VERCEL = 'https://desarpro.vercel.app';

const checks = [];
function ok(name, pass, detail) {
  checks.push({ name, pass, detail });
  console.log((pass ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' | ' + detail : ''));
}

async function main() {
  const health = await fetch(API + '/api/health');
  const h = await health.json().catch(() => ({}));
  ok('health status', health.status === 200 || health.status === 503, String(health.status));
  ok('health database.connected', h.database?.connected === true, JSON.stringify(h.database || {}));
  ok('health provider sqlite', h.database?.provider === 'sqlite', h.database?.provider || 'missing');

  const pre = await fetch(API + '/api/login', {
    method: 'OPTIONS',
    headers: {
      Origin: VERCEL,
      'Access-Control-Request-Method': 'PATCH',
      'Access-Control-Request-Headers': 'content-type,x-admin-token',
    },
  });
  const methods = pre.headers.get('access-control-allow-methods') || '';
  ok('cors PATCH', methods.includes('PATCH'), methods);

  const evil = await fetch(API + '/api/health', { headers: { Origin: 'https://evil.vercel.app' } });
  const evilA = evil.headers.get('access-control-allow-origin');
  ok('cors reject evil', !evilA || evilA === 'null', evilA || 'none');

  for (const path of ['/api/admin/users', '/api/admin/integrations/status', '/api/notifications']) {
    const r = await fetch(API + path);
    ok('route exists ' + path, r.status !== 404, String(r.status));
  }

  const cms = await fetch(API + '/api/content?lang=es');
  ok('cms', cms.status === 200, String(cms.status));

  const html = await (await fetch(VERCEL)).text();
  const meta = html.match(/name="desarpro:api"\s+content="([^"]+)"/);
  ok('vercel meta api', meta && meta[1].includes('railway.app'), meta ? meta[1] : 'missing');

  const failed = checks.filter((c) => !c.pass);
  console.log('\n---');
  console.log(failed.length ? `RESULTADO: ${checks.length - failed.length}/${checks.length} — revisar Railway vars + redeploy` : `RESULTADO: ${checks.length}/${checks.length} OK`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
