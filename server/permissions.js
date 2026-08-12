// Role-based permissions — backend enforcement.

const PERMISSIONS = {
  USERS_VIEW: 'USERS_VIEW',
  USERS_CREATE: 'USERS_CREATE',
  USERS_EDIT: 'USERS_EDIT',
  USERS_DELETE: 'USERS_DELETE',
  CLIENTS_VIEW: 'CLIENTS_VIEW',
  CLIENTS_CREATE: 'CLIENTS_CREATE',
  CLIENTS_EDIT: 'CLIENTS_EDIT',
  CLIENTS_DELETE: 'CLIENTS_DELETE',
  CLIENTS_APPROVE: 'CLIENTS_APPROVE',
  CLIENTS_SUSPEND: 'CLIENTS_SUSPEND',
  PROJECTS_VIEW: 'PROJECTS_VIEW',
  PROJECTS_CREATE: 'PROJECTS_CREATE',
  PROJECTS_EDIT: 'PROJECTS_EDIT',
  PROJECTS_DELETE: 'PROJECTS_DELETE',
  LEADS_VIEW: 'LEADS_VIEW',
  LEADS_EDIT: 'LEADS_EDIT',
  LEADS_CONVERT: 'LEADS_CONVERT',
  CONTENT_VIEW: 'CONTENT_VIEW',
  CONTENT_EDIT: 'CONTENT_EDIT',
  CMS_VIEW: 'CMS_VIEW',
  CMS_EDIT: 'CMS_EDIT',
  CHAT_VIEW: 'CHAT_VIEW',
  CHAT_REPLY: 'CHAT_REPLY',
  SETTINGS_VIEW: 'SETTINGS_VIEW',
  SETTINGS_EDIT: 'SETTINGS_EDIT',
  INTEGRATIONS_VIEW: 'INTEGRATIONS_VIEW',
  INTEGRATIONS_EDIT: 'INTEGRATIONS_EDIT',
  WEBHOOKS_VIEW: 'WEBHOOKS_VIEW',
  WEBHOOKS_EDIT: 'WEBHOOKS_EDIT',
  ACTIVITY_VIEW: 'ACTIVITY_VIEW',
};

const ADMIN_DEFAULT = Object.values(PERMISSIONS);

function parsePermissions(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

function getUserPermissions(user) {
  if (!user) return [];
  if (user.role === 'super_admin') return ['*'];
  if (user.role === 'admin') {
    const custom = parsePermissions(user.permissions);
    return custom.length ? custom : ADMIN_DEFAULT;
  }
  return [];
}

function hasPermission(user, permission) {
  const perms = getUserPermissions(user);
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, error: 'No autenticado' });
    if (req.user.role === 'super_admin') return next();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'No autorizado' });
    }
    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ ok: false, error: 'Permiso denegado', permission });
    }
    next();
  };
}

function canAssignRole(actor, targetRole) {
  if (!actor) return false;
  if (actor.role === 'super_admin') return true;
  if (actor.role === 'admin' && targetRole === 'client') return true;
  return false;
}

module.exports = {
  PERMISSIONS,
  ADMIN_DEFAULT,
  parsePermissions,
  getUserPermissions,
  hasPermission,
  requirePermission,
  canAssignRole,
};
