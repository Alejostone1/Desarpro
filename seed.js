const fs = require('fs');
const path = require('path');
const vm = require('vm');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { LANGUAGES, CONTENT_DEFAULTS, ALL_KEYS, sectionFor, typeFor, resolveValue, resolveProjectTranslations, PROJECT_SEED, resolveServiceSeed, TECHNOLOGY_SEED, SEO_DEFAULTS, SITE_CONFIG_DEFAULTS } = require('./src/lib/contentSeedData.js');

// --- Flags de seed (producción segura) ---
const IS_PROD = process.env.NODE_ENV === 'production';
const SEED_RESET_PASSWORDS = process.env.SEED_RESET_PASSWORDS === '1';
const SEED_DEMO_USERS = process.env.SEED_DEMO_USERS !== '0';
const SEED_UPDATE_CONTENT = process.env.SEED_UPDATE_CONTENT === '1' || !IS_PROD;
const SEED_UPDATE_CATALOG = process.env.SEED_UPDATE_CATALOG === '1' || !IS_PROD;
const SEED_UPDATE_SITE_CONFIG = process.env.SEED_UPDATE_SITE_CONFIG === '1';
const SEED_UPDATE_SEO = process.env.SEED_UPDATE_SEO === '1' || !IS_PROD;

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Android.13';

function loadTranslations() {
  const file = path.join(__dirname, 'src', 'i18n', 'translations.jsx');
  const code = fs.readFileSync(file, 'utf8');
  const sandbox = {};
  vm.runInNewContext(code, sandbox, { filename: file });
  return sandbox.__i18nTranslations || {};
}
const TRANSLATIONS = loadTranslations();
const PROJECTS = PROJECT_SEED;

async function hashPassword(raw) {
  return bcrypt.hash(raw, 10);
}

/** Crea usuario demo si no existe. Usuario existente: no toca password, rol ni datos. */
async function ensureDemoUser(data) {
  const { email, role, firstName, lastName, status = 'ACTIVE', company, phone, password } = data;
  const existing = await prisma.user.findUnique({ where: { email } });
  const pwd = password || DEMO_PASSWORD;

  if (existing) {
    if (SEED_RESET_PASSWORDS) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash: await hashPassword(pwd) },
      });
      console.log('[seed] Contraseña actualizada (SEED_RESET_PASSWORDS=1):', email);
    } else {
      console.log('[seed] Usuario existente — sin cambios:', email);
    }
    return existing;
  }

  const created = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(pwd),
      role,
      status,
      firstName,
      lastName,
      company: company || '',
      phone: phone || '',
    },
  });
  console.log('[seed] Usuario creado:', email);
  return created;
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@desarpro.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || DEMO_PASSWORD;
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (SEED_RESET_PASSWORDS) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash: await hashPassword(password) },
      });
      console.log('[seed] Admin contraseña actualizada (SEED_RESET_PASSWORDS=1):', email);
    } else {
      console.log('[seed] Admin existente — sin cambios:', email);
    }
    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      role: 'admin',
      status: 'ACTIVE',
      firstName: 'Admin',
      lastName: 'DesarPro',
    },
  });
  console.log('[seed] Admin creado:', email);
}

async function seedDemoClient() {
  await ensureDemoUser({
    email: 'super@desarpro.com',
    role: 'super_admin',
    firstName: 'Super',
    lastName: 'Admin',
  });

  const clients = [
    { email: 'cliente@demo.com', firstName: 'Juan', lastName: 'Pérez', company: 'Demo Corp', phone: '+34 600 000 001' },
    { email: 'maria@demo.com', firstName: 'María', lastName: 'García', company: 'Tech Solutions', phone: '+34 600 000 002' },
  ];

  for (const c of clients) {
    const user = await ensureDemoUser({ ...c, role: 'client', status: 'ACTIVE' });

    const projects = [
      { title: 'DesarPro Website', description: 'Rediseño corporativo.', status: 'DEVELOPMENT', progress: 65, priority: 'HIGH', clientId: user.id },
      { title: 'Sistema Administrativo', description: 'Portal admin + clientes.', status: 'PLANNING', progress: 20, priority: 'MEDIUM', clientId: user.id },
      { title: 'App Móvil', description: 'Aplicación iOS/Android.', status: 'DESIGN', progress: 40, priority: 'LOW', clientId: user.id },
    ];
    for (const p of projects) {
      const existing = await prisma.clientProject.findFirst({ where: { clientId: user.id, title: p.title } });
      if (existing) {
        if (SEED_UPDATE_CATALOG) {
          await prisma.clientProject.update({ where: { id: existing.id }, data: p });
        }
      } else {
        await prisma.clientProject.create({ data: { ...p, startDate: new Date(), technologies: JSON.stringify(['React', 'Node.js']) } });
      }
    }

    let conv = await prisma.conversation.findFirst({ where: { clientId: user.id, subject: 'Consulta general' } });
    if (!conv) {
      conv = await prisma.conversation.create({ data: { clientId: user.id, subject: 'Consulta general', lastMessageAt: new Date() } });
    }
    const admin = await prisma.user.findFirst({ where: { role: { in: ['admin', 'super_admin'] } } });
    if (admin) {
      const msgs = [
        { senderId: admin.id, content: `Hola ${c.firstName}, bienvenido al portal DesarPro.` },
        { senderId: user.id, content: 'Gracias, ¿cómo va el desarrollo?' },
        { senderId: admin.id, content: 'Avanzamos según lo planificado. Te mantendremos informado.' },
      ];
      const msgCount = await prisma.message.count({ where: { conversationId: conv.id } });
      if (msgCount < msgs.length) {
        for (const m of msgs.slice(msgCount)) {
          await prisma.message.create({ data: { conversationId: conv.id, ...m } });
        }
      }
    }
    console.log('[seed] Cliente demo verificado:', c.email);
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
      if (SEED_UPDATE_CONTENT) {
        contentKey = await prisma.contentKey.update({ where: { key }, data: { section, type, order } });
      } else {
        contentKey = existingKey;
      }
    } else {
      contentKey = await prisma.contentKey.create({ data: { key, section, type, order } });
      createdKeys += 1;
    }

    for (const lang of LANGUAGES) {
      const value = resolveValue(TRANSLATIONS, lang, key);
      const existing = await prisma.contentTranslation.findUnique({
        where: { contentKeyId_lang: { contentKeyId: contentKey.id, lang } },
      });
      if (existing) {
        if (SEED_UPDATE_CONTENT && existing.value !== value) {
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
  console.log(`[seed] Contenido: +${createdKeys} claves · +${createdTr} traducciones · ~${updatedTr} actualizadas (update=${SEED_UPDATE_CONTENT})`);
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
      if (SEED_UPDATE_CATALOG) {
        project = await prisma.project.update({ where: { slug: p.slug }, data });
        updated += 1;
      } else {
        project = existingProject;
      }
    } else {
      project = await prisma.project.create({ data: { slug: p.slug, ...data } });
      created += 1;
    }

    for (const lang of LANGUAGES) {
      const tr = lang === 'es' ? p : (resolveProjectTranslations(p.slug, lang) || p);
      const existing = await prisma.projectTranslation.findUnique({
        where: { projectId_lang: { projectId: project.id, lang } },
      });
      if (existing) {
        if (SEED_UPDATE_CATALOG && (existing.title !== tr.title || existing.tagline !== tr.tagline || existing.desc !== tr.desc)) {
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
  console.log(`[seed] Portafolio: +${created} · ~${updated} actualizados (update=${SEED_UPDATE_CATALOG})`);
}

async function seedServices() {
  const services = resolveServiceSeed(TRANSLATIONS);
  let created = 0;
  let updated = 0;

  for (const s of services) {
    const existing = await prisma.service.findUnique({ where: { slug: s.slug } });
    if (existing) {
      if (SEED_UPDATE_CATALOG) {
        await prisma.service.update({
          where: { slug: s.slug },
          data: { kind: s.kind, icon: s.icon, color: s.color, featured: s.featured, active: true, order: s.order },
        });
        updated += 1;
      }
    } else {
      await prisma.service.create({
        data: { slug: s.slug, kind: s.kind, icon: s.icon, color: s.color, featured: s.featured, active: true, order: s.order },
      });
      created += 1;
    }
    const row = await prisma.service.findUnique({ where: { slug: s.slug } });
    for (const lang of LANGUAGES) {
      const tr = s.translations[lang];
      const existingTr = await prisma.serviceTranslation.findUnique({
        where: { serviceId_lang: { serviceId: row.id, lang } },
      });
      if (existingTr) {
        if (SEED_UPDATE_CATALOG) {
          await prisma.serviceTranslation.update({
            where: { serviceId_lang: { serviceId: row.id, lang } },
            data: {
              name: tr.name, tagline: tr.tagline,
              bullets: JSON.stringify(tr.bullets || []),
              overview: tr.overview,
              deliverables: JSON.stringify(tr.deliverables || []),
              process: JSON.stringify(tr.process || []),
            },
          });
        }
      } else {
        await prisma.serviceTranslation.create({
          data: {
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
  }
  console.log(`[seed] Servicios: +${created} · ~${updated} (update=${SEED_UPDATE_CATALOG})`);
}

async function seedTechnologies() {
  let created = 0;
  let updated = 0;
  for (let i = 0; i < TECHNOLOGY_SEED.length; i++) {
    const t = TECHNOLOGY_SEED[i];
    const existing = await prisma.technology.findUnique({ where: { name: t.name } });
    if (existing) {
      if (SEED_UPDATE_CATALOG) {
        await prisma.technology.update({
          where: { name: t.name },
          data: { color: t.color, category: t.category, featured: true, active: true, order: i },
        });
        updated += 1;
      }
    } else {
      await prisma.technology.create({
        data: { name: t.name, color: t.color, category: t.category, featured: true, active: true, order: i },
      });
      created += 1;
    }
  }
  console.log(`[seed] Tecnologías: +${created} · ~${updated}`);
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
        if (SEED_UPDATE_SEO) {
          await prisma.seoEntry.update({ where: { route_lang: { route, lang } }, data });
          updated += 1;
        }
      } else {
        await prisma.seoEntry.create({ data: { route, lang, ...data } });
        created += 1;
      }
    }
  }
  console.log(`[seed] SEO: +${created} · ~${updated} (update=${SEED_UPDATE_SEO})`);
}

async function seedSiteConfig() {
  let created = 0;
  let updated = 0;
  for (const key of Object.keys(SITE_CONFIG_DEFAULTS)) {
    const value = JSON.stringify(SITE_CONFIG_DEFAULTS[key]);
    const existing = await prisma.siteConfig.findUnique({ where: { key } });
    if (existing) {
      if (SEED_UPDATE_SITE_CONFIG && existing.value !== value) {
        await prisma.siteConfig.update({ where: { key }, data: { value } });
        updated += 1;
      }
    } else {
      await prisma.siteConfig.create({ data: { key, value } });
      created += 1;
    }
  }
  console.log(`[seed] SiteConfig: +${created} · ~${updated}`);
}

async function main() {
  console.log('[seed] Modo:', IS_PROD ? 'production' : 'development');
  console.log('[seed] Flags: demo=', SEED_DEMO_USERS, 'resetPwd=', SEED_RESET_PASSWORDS, 'content=', SEED_UPDATE_CONTENT, 'catalog=', SEED_UPDATE_CATALOG);

  if (SEED_DEMO_USERS) {
    await seedAdmin();
    await seedDemoClient();
  }
  await seedContent();
  await seedProjects();
  await seedServices();
  await seedTechnologies();
  await seedSeo();
  await seedSiteConfig();
  console.log('[seed] Completado.');
}

main().catch((e) => {
  console.error('[seed] Error:', e.message || e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
