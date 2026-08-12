// Auth helpers shared by server.js and portal routes.

const { getUserPermissions, parsePermissions } = require('./permissions');

const ADMIN_ROLES = new Set(['admin', 'super_admin']);

function isAdminRole(role) {
  return ADMIN_ROLES.has(role);
}

function isClientRole(role) {
  return role === 'client';
}

function serializeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status || 'ACTIVE',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    company: user.company || '',
    jobTitle: user.jobTitle || '',
    permissions: getUserPermissions(user),
    mustChangePassword: !!user.mustChangePassword,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    createdAt: user.createdAt ? user.createdAt.toISOString() : null,
  };
}

function serializeNotification(n) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    readAt: n.readAt ? n.readAt.toISOString() : null,
    meta: parseJson(n.meta, {}),
    createdAt: n.createdAt.toISOString(),
  };
}

function parseJson(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch (e) { return fallback; }
  }
  return fallback;
}

function serializeClientProject(p) {
  return {
    id: p.id,
    clientId: p.clientId,
    assigneeId: p.assigneeId || null,
    title: p.title,
    description: p.description,
    status: p.status,
    priority: p.priority || 'MEDIUM',
    progress: p.progress,
    technologies: parseJson(p.technologies),
    deliverables: parseJson(p.deliverables),
    milestones: parseJson(p.milestones),
    startDate: p.startDate ? p.startDate.toISOString() : null,
    dueDate: p.dueDate ? p.dueDate.toISOString() : null,
    completedAt: p.completedAt ? p.completedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    client: p.client ? serializeUser(p.client) : undefined,
    assignee: p.assignee ? serializeUser(p.assignee) : undefined,
  };
}

function serializeMessage(m) {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    content: m.content,
    readAt: m.readAt ? m.readAt.toISOString() : null,
    createdAt: m.createdAt.toISOString(),
    sender: m.sender ? serializeUser(m.sender) : undefined,
  };
}

function serializeConversation(c, unread = 0) {
  return {
    id: c.id,
    clientId: c.clientId,
    projectId: c.projectId,
    subject: c.subject,
    lastMessageAt: c.lastMessageAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
    client: c.client ? serializeUser(c.client) : undefined,
    project: c.project ? { id: c.project.id, title: c.project.title } : null,
    lastMessage: c.messages && c.messages[0] ? serializeMessage(c.messages[0]) : null,
    unreadCount: unread,
  };
}

async function createNotification(prisma, { userId, type, title, body, meta }) {
  try {
    const metaStr = JSON.stringify(meta || {});
    const since = new Date(Date.now() - 5 * 60 * 1000);
    const dup = await prisma.notification.findFirst({
      where: { userId, type: type || 'info', meta: metaStr, createdAt: { gte: since } },
    });
    if (dup) return dup;
    return await prisma.notification.create({
      data: {
        userId,
        type: type || 'info',
        title: title || '',
        body: body || '',
        meta: JSON.stringify(meta || {}),
      },
    });
  } catch (e) {
    console.warn('[notification]', e.message);
    return null;
  }
}

async function notifyAdmins(prisma, payload) {
  const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'super_admin'] }, status: 'ACTIVE' } });
  await Promise.all(admins.map((a) => createNotification(prisma, { userId: a.id, ...payload })));
}

async function logActivity(prisma, { userId, action, entity, entityId, meta }) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: userId || null,
        action,
        entity: entity || '',
        entityId: entityId != null ? String(entityId) : '',
        meta: JSON.stringify(meta || {}),
      },
    });
  } catch (e) {
    console.warn('[activity]', e.message);
  }
}

async function invalidateUserSessions(prisma, userId) {
  try {
    await prisma.session.deleteMany({ where: { userId } });
  } catch (e) {
    console.warn('[session] invalidate failed:', e.message);
  }
}

function userBlocked(user) {
  if (!user) return true;
  const blocked = ['REJECTED', 'SUSPENDED', 'BLOCKED', 'INACTIVE'];
  if (blocked.includes(user.status)) return true;
  if (user.status === 'PENDING' && user.role === 'client') return true;
  return false;
}

module.exports = {
  ADMIN_ROLES,
  isAdminRole,
  isClientRole,
  serializeUser,
  serializeClientProject,
  serializeMessage,
  serializeConversation,
  serializeNotification,
  parseJson,
  logActivity,
  createNotification,
  notifyAdmins,
  userBlocked,
  invalidateUserSessions,
};
