// Verify portal i18n key parity across ES EN PT FR DE
(async () => {
  const { PORTAL_I18N } = await import('../src/i18n/portalTranslations.js');

  function flatten(obj, prefix = '') {
    const out = {};
    for (const [k, v] of Object.entries(obj || {})) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, key));
      else out[key] = v;
    }
    return out;
  }

  const langs = ['es', 'en', 'pt', 'fr', 'de'];
  const flat = {};
  langs.forEach((l) => { flat[l] = flatten(PORTAL_I18N[l]); });
  const baseKeys = new Set(Object.keys(flat.es));
  let ok = true;
  for (const lang of langs) {
    const keys = new Set(Object.keys(flat[lang]));
    for (const k of baseKeys) {
      if (!keys.has(k)) { console.error(`MISSING ${lang}: ${k}`); ok = false; }
    }
    for (const k of keys) {
      if (!baseKeys.has(k)) { console.error(`EXTRA ${lang}: ${k}`); ok = false; }
    }
  }
  console.log(ok ? `i18n parity OK (${baseKeys.size} keys × 5 langs)` : 'i18n parity FAIL');
  process.exit(ok ? 0 : 1);
})();
