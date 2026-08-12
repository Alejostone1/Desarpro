// Admin sidebar navigation — grouped collapsible sections.

const ADMIN_NAV = [
  {
    id: 'dashboard',
    labelKey: 'portal.admin.nav.dashboard',
    items: [
      { id: 'dashboard', labelKey: 'portal.admin.nav.dashboard', icon: 'Activity', always: true },
    ],
  },
  {
    id: 'operation',
    labelKey: 'portal.admin.nav.operation',
    items: [
      { id: 'client_projects', labelKey: 'portal.admin.nav.clientProjects', icon: 'Folder', always: true, badgeKey: 'projects' },
      { id: 'leads', labelKey: 'portal.admin.nav.leads', icon: 'Mail', always: true, badgeKey: 'leads' },
      { id: 'services', labelKey: 'portal.admin.nav.services', icon: 'Layers', always: true },
      { id: 'tech', labelKey: 'portal.admin.nav.tech', icon: 'Cpu', always: true },
    ],
  },
  {
    id: 'access',
    labelKey: 'portal.admin.nav.access',
    items: [
      { id: 'clients', labelKey: 'portal.admin.nav.clients', icon: 'Users', always: true, badgeKey: 'clients' },
      { id: 'users', labelKey: 'portal.admin.nav.users', icon: 'Users', always: true },
      { id: 'messages', labelKey: 'portal.admin.nav.conversations', icon: 'Mail', always: true, badgeKey: 'messages' },
      { id: 'activity', labelKey: 'portal.admin.nav.activity', icon: 'Activity', always: true },
      { id: 'admins', labelKey: 'portal.admin.nav.admins', icon: 'Shield', always: true },
      { id: 'permissions', labelKey: 'portal.admin.nav.permissions', icon: 'Lock', always: true },
    ],
  },
  {
    id: 'content',
    labelKey: 'portal.admin.nav.siteContent',
    items: [
      { id: 'hero', labelKey: 'portal.admin.nav.hero', icon: 'Sparkle', prefixes: ['hero.'], always: true },
      { id: 'stats', labelKey: 'portal.admin.nav.stats', icon: 'BarChart', prefixes: ['stats.'], always: true },
      { id: 'home_services', labelKey: 'portal.admin.nav.homeServices', icon: 'Layers', prefixes: ['services.'], always: true },
      { id: 'home_tech', labelKey: 'portal.admin.nav.homeTech', icon: 'Cpu', prefixes: ['tech.'], always: true },
      { id: 'process', labelKey: 'portal.admin.nav.process', icon: 'Compass', prefixes: ['process.'], always: true },
      { id: 'cta', labelKey: 'portal.admin.nav.cta', icon: 'ArrowRight', prefixes: ['cta.'], always: true },
      { id: 'portfolio', labelKey: 'portal.admin.nav.portfolio', icon: 'Layers', always: true },
      { id: 'about', labelKey: 'portal.admin.nav.about', icon: 'Users', prefixes: ['about.'], always: true },
      { id: 'contact', labelKey: 'portal.admin.nav.contact', icon: 'Mail', prefixes: ['contact.'], always: true },
      { id: 'login', labelKey: 'portal.admin.nav.loginPage', icon: 'Lock', prefixes: ['login.'], always: true },
      { id: 'footer', labelKey: 'portal.admin.nav.footer', icon: 'Globe', prefixes: ['footer.'], always: true },
      { id: 'other', labelKey: 'portal.admin.nav.other', icon: 'Settings', prefixes: [] },
    ],
  },
  {
    id: 'system',
    labelKey: 'portal.admin.nav.system',
    items: [
      { id: 'general', labelKey: 'portal.admin.nav.general', icon: 'Settings', always: true },
      { id: 'languages', labelKey: 'portal.admin.nav.languages', icon: 'Globe', always: true },
      { id: 'appearance', labelKey: 'portal.admin.nav.appearance', icon: 'Sparkle', always: true },
      { id: 'integrations', labelKey: 'portal.admin.nav.integrations', icon: 'Layers', always: true },
      { id: 'config', labelKey: 'portal.admin.nav.config', icon: 'Settings', always: true },
      { id: 'seo', labelKey: 'portal.admin.nav.seo', icon: 'Search', always: true },
    ],
  },
];

export { ADMIN_NAV };
