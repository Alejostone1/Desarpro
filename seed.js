const fs = require('fs');
const path = require('path');
const vm = require('vm');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { LANGUAGES, CONTENT_DEFAULTS, ALL_KEYS, sectionFor, typeFor, resolveValue, resolveProjectTranslations, PROJECT_SEED, resolveServiceSeed, TECHNOLOGY_SEED, SEO_DEFAULTS, SITE_CONFIG_DEFAULTS } = require('./src/lib/contentSeedData.js');

// Load the real i18n translations (ES/EN/PT/FR/DE) so the DB is seeded with
// the exact strings the site already uses — nothing invented.
function loadTranslations() {
  const file = path.join(__dirname, 'src', 'i18n', 'translations.jsx');
  const code = fs.readFileSync(file, 'utf8');
  const sandbox = {};
  vm.runInNewContext(code, sandbox, { filename: file });
  return sandbox.__i18nTranslations || {};
}
const TRANSLATIONS = loadTranslations();

// Canonical project catalog — centralized in src/lib/contentSeedData.js
// (PROJECT_SEED) so seed.js and the API reset flow share one source of truth.
const PROJECTS = PROJECT_SEED;

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@desarpro.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Administrador01';
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('[seed] ADMIN_PASSWORD no está definido: usando la contraseña por defecto (SOLO desarrollo). En producción define ADMIN_EMAIL y ADMIN_PASSWORD.');
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(password, 10);
  if (existing) {
    // Solo re-seteamos la contraseña si se configuró explícitamente por env;
    // así un password custom que exista en la BD no se pierde con cada seed.
    if (process.env.ADMIN_PASSWORD) {
      await prisma.user.update({ where: { id: existing.id }, data: { passwordHash } });
      console.log('Usuario admin actualizado:', email);
    } else {
      console.log('Usuario admin ya existe:', email);
    }
  } else {
    await prisma.user.create({ data: { email, passwordHash, role: 'admin' } });
    console.log('Usuario admin creado:', email);
  }
}

async function seedContent() {
  let createdKeys = 0;
  let createdTr = 0;
  let updatedTr = 0;

  for (const key of ALL_KEYS) {
    const section = sectionFor(key);
    const type = typeFor(key);
    const order = ALL_KEYS.indexOf(key);

    const existingKey = await prisma.contentKey.findUnique({ where: { key } });
    let contentKey;
    if (existingKey) {
      contentKey = await prisma.contentKey.update({
        where: { key },
        data: { section, type, order },
      });
    } else {
      contentKey = await prisma.contentKey.create({
        data: { key, section, type, order },
      });
      createdKeys += 1;
    }

    for (const lang of LANGUAGES) {
      const value = resolveValue(TRANSLATIONS, lang, key);
      const existing = await prisma.contentTranslation.findUnique({
        where: { contentKeyId_lang: { contentKeyId: contentKey.id, lang } },
      });
      if (existing) {
        if (existing.value !== value) {
          await prisma.contentTranslation.update({
            where: { contentKeyId_lang: { contentKeyId: contentKey.id, lang } },
            data: { value },
          });
          updatedTr += 1;
        }
      } else {
        await prisma.contentTranslation.create({
          data: { contentKeyId: contentKey.id, lang, value },
        });
        createdTr += 1;
      }
    }
  }
  console.log(`Contenido: ${createdKeys} claves creadas · ${createdTr} traducciones creadas · ${updatedTr} actualizadas (${ALL_KEYS.length} claves x ${LANGUAGES.length} idiomas)`);
}

async function seedProjects() {
  let created = 0;
  let updated = 0;
  let createdTr = 0;
  let updatedTr = 0;

  for (const p of PROJECTS) {
    const { tags, metrics, ...rest } = p;
    const data = {
      ...rest,
      active: true,
      tags: JSON.stringify(tags || []),
      metrics: JSON.stringify(metrics || []),
    };
    const existingProject = await prisma.project.findUnique({ where: { slug: p.slug } });
    let project;
    if (existingProject) {
      project = await prisma.project.update({ where: { slug: p.slug }, data });
      updated += 1;
    } else {
      project = await prisma.project.create({ data: { slug: p.slug, ...data } });
      created += 1;
    }

    // Seed translations for all 5 languages. ES canonical values come from the
    // project row itself; the others from PROJECT_TRANSLATIONS (fallback: ES).
    for (const lang of LANGUAGES) {
      const tr = lang === 'es' ? p : (resolveProjectTranslations(p.slug, lang) || p);
      const existing = await prisma.projectTranslation.findUnique({
        where: { projectId_lang: { projectId: project.id, lang } },
      });
      if (existing) {
        if (existing.title !== tr.title || existing.tagline !== tr.tagline || existing.desc !== tr.desc) {
          await prisma.projectTranslation.update({
            where: { projectId_lang: { projectId: project.id, lang } },
            data: { title: tr.title, tagline: tr.tagline, desc: tr.desc },
          });
          updatedTr += 1;
        }
      } else {
        await prisma.projectTranslation.create({
          data: { projectId: project.id, lang, title: tr.title, tagline: tr.tagline, desc: tr.desc },
        });
        createdTr += 1;
      }
    }
  }
  console.log(`Proyectos: ${created} creados / ${updated} actualizados · traducciones ${createdTr} creadas / ${updatedTr} actualizadas (${PROJECTS.length} x ${LANGUAGES.length} idiomas)`);
}

async function seedServices() {
  const services = resolveServiceSeed(TRANSLATIONS);
  let created = 0;
  let updated = 0;

  for (const s of services) {
    const existing = await prisma.service.findUnique({ where: { slug: s.slug } });
    if (existing) {
      await prisma.service.update({
        where: { slug: s.slug },
        data: { kind: s.kind, icon: s.icon, color: s.color, featured: s.featured, active: true, order: s.order },
      });
      updated += 1;
    } else {
      await prisma.service.create({
        data: { slug: s.slug, kind: s.kind, icon: s.icon, color: s.color, featured: s.featured, active: true, order: s.order },
      });
      created += 1;
    }
    const row = await prisma.service.findUnique({ where: { slug: s.slug } });
    for (const lang of LANGUAGES) {
      const tr = s.translations[lang];
      await prisma.serviceTranslation.upsert({
        where: { serviceId_lang: { serviceId: row.id, lang } },
        update: {
          name: tr.name, tagline: tr.tagline,
          bullets: JSON.stringify(tr.bullets || []),
          overview: tr.overview,
          deliverables: JSON.stringify(tr.deliverables || []),
          process: JSON.stringify(tr.process || []),
        },
        create: {
          serviceId: row.id, lang,
          name: tr.name, tagline: tr.tagline,
          bullets: JSON.stringify(tr.bullets || []),
          overview: tr.overview,
          deliverables: JSON.stringify(tr.deliverables || []),
          process: JSON.stringify(tr.process || []),
        },
      });
    }
  }
  console.log(`Servicios: ${created} creados / ${updated} actualizados (${services.length} x ${LANGUAGES.length} idiomas)`);
}

async function seedTechnologies() {
  let created = 0;
  let updated = 0;
  for (let i = 0; i < TECHNOLOGY_SEED.length; i++) {
    const t = TECHNOLOGY_SEED[i];
    const existing = await prisma.technology.findUnique({ where: { name: t.name } });
    if (existing) {
      await prisma.technology.update({
        where: { name: t.name },
        data: { color: t.color, category: t.category, featured: true, active: true, order: i },
      });
      updated += 1;
    } else {
      await prisma.technology.create({
        data: { name: t.name, color: t.color, category: t.category, featured: true, active: true, order: i },
      });
      created += 1;
    }
  }
  console.log(`Tecnologías: ${created} creadas / ${updated} actualizadas (${TECHNOLOGY_SEED.length})`);
}

async function seedSeo() {
  let created = 0;
  let updated = 0;
  for (const route of Object.keys(SEO_DEFAULTS)) {
    const def = SEO_DEFAULTS[route];
    for (const lang of LANGUAGES) {
      const data = {
        title: lang === 'es' ? def.title : '',
        description: lang === 'es' ? def.description : '',
        keywords: lang === 'es' ? (def.keywords || '') : '',
        ogTitle: lang === 'es' ? def.title : '',
        ogDescription: lang === 'es' ? def.description : '',
      };
      const existing = await prisma.seoEntry.findUnique({ where: { route_lang: { route, lang } } });
      if (existing) {
        await prisma.seoEntry.update({ where: { route_lang: { route, lang } }, data });
        updated += 1;
      } else {
        await prisma.seoEntry.create({ data: { route, lang, ...data } });
        created += 1;
      }
    }
  }
  console.log(`SEO: ${created} entradas creadas / ${updated} actualizadas (${Object.keys(SEO_DEFAULTS).length} rutas x ${LANGUAGES.length} idiomas)`);
}

async function seedSiteConfig() {
  let created = 0;
  let updated = 0;
  for (const key of Object.keys(SITE_CONFIG_DEFAULTS)) {
    const value = JSON.stringify(SITE_CONFIG_DEFAULTS[key]);
    const existing = await prisma.siteConfig.findUnique({ where: { key } });
    if (existing) {
      if (existing.value !== value) {
        await prisma.siteConfig.update({ where: { key }, data: { value } });
        updated += 1;
      }
    } else {
      await prisma.siteConfig.create({ data: { key, value } });
      created += 1;
    }
  }
  console.log(`Configuración: ${created} claves creadas / ${updated} actualizadas`);
}

async function main() {
  await seedAdmin();
  await seedContent();
  await seedProjects();
  await seedServices();
  await seedTechnologies();
  await seedSeo();
  await seedSiteConfig();
  console.log('Seed completado. El contenido ahora vive en la base de datos (SQLite).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
