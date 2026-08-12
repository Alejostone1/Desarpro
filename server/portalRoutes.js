// Portal routes: users, clients, client projects, messaging, auth extensions.

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {
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
} = require('./authUtils');
const { PERMISSIONS, requirePermission, canAssignRole, hasPermission } = require('./permissions');
const { sendEmail } = require('./emailService');
const { dispatchWebhooks } = require('./webhookService');

function hashResetToken(raw) {
  return crypto.createHash('sha256').update(String(raw)).digest('hex');
}

function registerPortalRoutes(app, deps) {
  const { prisma, requireAuth, createSession, getToken } = deps;

  function requireAdmin(req, res, next) {
    if (!req.user || !isAdminRole(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'No autorizado' });
    }
    next();
  }

  function requireClient(req, res, next) {
    if (!req.user || !isClientRole(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'No autorizado' });
    }
    if (userBlocked(req.user)) {
      return res.status(403).json({ ok: false, error: 'Cuenta inactiva' });
    }
    next();
  }

  // ---------- Auth extensions ----------
  app.get('/api/auth/me', requireAuth, async (req, res) => {
    res.json({ ok: true, user: serializeUser(req.user) });
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    try {
      const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
      if (user) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
        await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: hashResetToken(rawToken),
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        });
        const base = (process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
        await sendEmail({
          to: user.email,
          template: 'passwordReset',
          data: { url: `${base}/#/reset-password?token=${rawToken}` },
        });
      }
      res.json({ ok: true, message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al procesar solicitud' });
    }
  });

  app.get('/api/auth/reset-password/validate', async (req, res) => {
    const raw = String(req.query.token || '');
    if (!raw) return res.status(400).json({ ok: false, error: 'Token requerido' });
    try {
      const row = await prisma.passwordResetToken.findFirst({
        where: { tokenHash: hashResetToken(raw), usedAt: null, expiresAt: { gt: new Date() } },
      });
      res.json({ ok: !!row, valid: !!row });
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    const raw = String(req.body?.token || '');
    const pwd = String(req.body?.password || '');
    const confirm = String(req.body?.passwordConfirm || pwd);
    if (!raw || !pwd) return res.status(400).json({ ok: false, error: 'Token y contraseña requeridos' });
    if (pwd.length < 6) return res.status(400).json({ ok: false, error: 'Contraseña mínima 6 caracteres' });
    if (pwd !== confirm) return res.status(400).json({ ok: false, error: 'Las contraseñas no coinciden' });
    try {
      const row = await prisma.passwordResetToken.findFirst({
        where: { tokenHash: hashResetToken(raw), usedAt: null, expiresAt: { gt: new Date() } },
        include: { user: true },
      });
      if (!row) return res.status(400).json({ ok: false, error: 'Token inválido o expirado' });
      await prisma.$transaction([
        prisma.user.update({
          where: { id: row.userId },
          data: { passwordHash: await bcrypt.hash(pwd, 10), mustChangePassword: false },
        }),
        prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
        prisma.session.deleteMany({ where: { userId: row.userId } }),
      ]);
      await logActivity(prisma, { userId: row.userId, action: 'RESET_PASSWORD', entity: 'user', entityId: row.userId });
      sendEmail({ to: row.user.email, template: 'passwordResetComplete', data: { name: row.user.firstName, url: process.env.APP_URL || '' } }).catch(() => {});
      res.json({ ok: true, message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al restablecer contraseña' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    const { email, password, passwordConfirm, firstName, lastName, name, phone, company } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const pwd = String(password || '');
    const confirm = String(passwordConfirm || password || '');
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ ok: false, error: 'Email válido requerido' });
    }
    if (!pwd || pwd.length < 6) {
      return res.status(400).json({ ok: false, error: 'Contraseña mínima 6 caracteres' });
    }
    if (pwd !== confirm) {
      return res.status(400).json({ ok: false, error: 'Las contraseñas no coinciden' });
    }
    try {
      const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (exists) {
        return res.status(409).json({ ok: false, error: 'El email ya está registrado' });
      }
      let fn = String(firstName || '').trim();
      let ln = String(lastName || '').trim();
      if (!fn && name) {
        const parts = String(name).trim().split(/\s+/);
        fn = parts[0] || '';
        ln = parts.slice(1).join(' ');
      }
      if (!fn) return res.status(400).json({ ok: false, error: 'Nombre requerido' });
      const passwordHash = await bcrypt.hash(pwd, 10);
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: 'client',
          status: 'PENDING',
          firstName: fn,
          lastName: ln,
          phone: String(phone || '').trim(),
          company: String(company || '').trim(),
        },
      });
      await logActivity(prisma, { userId: user.id, action: 'REGISTER', entity: 'user', entityId: user.id });
      await notifyAdmins(prisma, {
        type: 'client_registered',
        title: 'Nuevo cliente registrado',
        body: `${fn} ${ln} (${normalizedEmail}) — pendiente de aprobación`,
        meta: { userId: user.id },
      });
      await dispatchWebhooks(prisma, 'user.registered', { userId: user.id, email: normalizedEmail });
      await sendEmail({ to: normalizedEmail, template: 'welcome', data: { name: fn, url: process.env.APP_URL || process.env.FRONTEND_URL || '' } });
      res.status(201).json({
        ok: true,
        pending: true,
        message: 'Registro recibido. Un administrador activará tu cuenta pronto.',
        user: serializeUser(user),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al registrar' });
    }
  });

  // ---------- Admin: users ----------
  app.get('/api/admin/users', requireAuth, requireAdmin, requirePermission(PERMISSIONS.USERS_VIEW), async (req, res) => {
    try {
      const q = String(req.query.q || '').trim().toLowerCase();
      const role = String(req.query.role || '').trim();
      const status = String(req.query.status || '').trim();
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(10, Number(req.query.limit) || 25));
      const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
      let list = users.map(serializeUser);
      if (role === 'admin') list = list.filter((u) => u.role === 'admin' || u.role === 'super_admin');
      else if (role) list = list.filter((u) => u.role === role);
      if (status) list = list.filter((u) => u.status === status);
      if (q) {
        list = list.filter((u) =>
          u.email.includes(q)
          || `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
        );
      }
      const total = list.length;
      const start = (page - 1) * limit;
      res.json({ ok: true, users: list.slice(start, start + limit), total, page, limit });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al listar usuarios' });
    }
  });

  app.get('/api/admin/users/:id', requireAuth, requireAdmin, requirePermission(PERMISSIONS.USERS_VIEW), async (req, res) => {
    const id = Number(req.params.id);
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
      res.json({ ok: true, user: serializeUser(user) });
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error al obtener usuario' });
    }
  });

  app.post('/api/admin/users', requireAuth, requireAdmin, requirePermission(PERMISSIONS.USERS_CREATE), async (req, res) => {
    const { email, password, role, status, firstName, lastName, phone, company } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ ok: false, error: 'Email y contraseña requeridos' });
    }
    const allowedRoles = ['client', 'admin', 'super_admin'];
    const userRole = allowedRoles.includes(role) ? role : 'client';
    if (!canAssignRole(req.user, userRole)) {
      return res.status(403).json({ ok: false, error: 'No puedes asignar ese rol' });
    }
    if (userRole === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ ok: false, error: 'Solo super_admin puede crear super_admin' });
    }
    try {
      const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (exists) return res.status(409).json({ ok: false, error: 'Email ya registrado' });
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: await bcrypt.hash(String(password), 10),
          role: userRole,
          status: status || 'ACTIVE',
          firstName: firstName || '',
          lastName: lastName || '',
          phone: phone || '',
          company: company || '',
          mustChangePassword: !!req.body.mustChangePassword,
        },
      });
      await logActivity(prisma, { userId: req.user.id, action: 'CREATE_USER', entity: 'user', entityId: user.id });
      res.status(201).json({ ok: true, user: serializeUser(user) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al crear usuario' });
    }
  });

  app.patch('/api/admin/users/:id', requireAuth, requireAdmin, requirePermission(PERMISSIONS.USERS_EDIT), async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: 'ID inválido' });
    try {
      const target = await prisma.user.findUnique({ where: { id } });
      if (!target) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
      if (isAdminRole(target.role) && req.user.role !== 'super_admin' && target.id !== req.user.id) {
        return res.status(403).json({ ok: false, error: 'No autorizado' });
      }
      const data = {};
      ['firstName', 'lastName', 'phone', 'company', 'status'].forEach((k) => {
        if (req.body[k] !== undefined) data[k] = req.body[k];
      });
      if (req.body.role !== undefined) {
        if (req.user.role !== 'super_admin') {
          return res.status(403).json({ ok: false, error: 'Solo super_admin puede cambiar roles' });
        }
        if (req.body.role === 'super_admin' && target.id === req.user.id) {
          return res.status(403).json({ ok: false, error: 'No puedes auto-promoverte' });
        }
        if (!canAssignRole(req.user, req.body.role)) {
          return res.status(403).json({ ok: false, error: 'Rol no permitido' });
        }
        data.role = req.body.role;
      }
      if (req.body.permissions !== undefined && req.user.role === 'super_admin') {
        data.permissions = JSON.stringify(req.body.permissions || []);
      }
      if (req.body.jobTitle !== undefined) data.jobTitle = req.body.jobTitle;
      if (req.body.password) data.passwordHash = await bcrypt.hash(String(req.body.password), 10);
      const prevStatus = target.status;
      const user = await prisma.user.update({ where: { id }, data });
      if (req.body.status === 'ACTIVE' && prevStatus === 'PENDING' && user.role === 'client') {
        await createNotification(prisma, {
          userId: user.id,
          type: 'account_activated',
          title: 'Cuenta activada',
          body: 'Tu cuenta ha sido aprobada. Ya puedes iniciar sesión.',
          meta: {},
        });
        await sendEmail({ to: user.email, template: 'clientApproved', data: { name: user.firstName || user.email } });
      }
      if (['REJECTED', 'SUSPENDED', 'BLOCKED'].includes(req.body.status)) {
        await invalidateUserSessions(prisma, user.id);
        if (user.role === 'client') {
          await createNotification(prisma, {
            userId: user.id,
            type: req.body.status === 'REJECTED' ? 'account_rejected' : 'account_suspended',
            title: req.body.status === 'REJECTED' ? 'Registro rechazado' : 'Cuenta suspendida',
            body: req.body.status === 'REJECTED' ? 'Tu solicitud de registro fue rechazada.' : 'Tu cuenta ha sido suspendida.',
            meta: {},
          });
        }
      }
      await logActivity(prisma, { userId: req.user.id, action: 'UPDATE_USER', entity: 'user', entityId: id });
      res.json({ ok: true, user: serializeUser(user) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al actualizar usuario' });
    }
  });

  app.post('/api/admin/users/:id/reset-password', requireAuth, requireAdmin, requirePermission(PERMISSIONS.USERS_EDIT), async (req, res) => {
    const id = Number(req.params.id);
    const newPassword = String(req.body?.password || `Temp${Date.now().toString(36)}`);
    try {
      const target = await prisma.user.findUnique({ where: { id } });
      if (!target) return res.status(404).json({ ok: false, error: 'No encontrado' });
      if (target.role === 'super_admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ ok: false, error: 'No autorizado' });
      }
      await prisma.user.update({
        where: { id },
        data: { passwordHash: await bcrypt.hash(newPassword, 10), mustChangePassword: true },
      });
      await logActivity(prisma, { userId: req.user.id, action: 'RESET_PASSWORD', entity: 'user', entityId: id });
      res.json({ ok: true, tempPassword: newPassword });
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error al restablecer contraseña' });
    }
  });

  app.delete('/api/admin/users/:id', requireAuth, requireAdmin, requirePermission(PERMISSIONS.USERS_DELETE), async (req, res) => {
    const id = Number(req.params.id);
    if (!id || id === req.user.id) {
      return res.status(400).json({ ok: false, error: 'No se puede eliminar' });
    }
    try {
      const target = await prisma.user.findUnique({ where: { id } });
      if (!target) return res.status(404).json({ ok: false, error: 'No encontrado' });
      if (target.role === 'super_admin') {
        return res.status(403).json({ ok: false, error: 'No se puede eliminar super_admin' });
      }
      await prisma.user.delete({ where: { id } });
      await logActivity(prisma, { userId: req.user.id, action: 'DELETE_USER', entity: 'user', entityId: id });
      res.json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al eliminar' });
    }
  });

  // ---------- Admin: clients (users with role client) ----------
  app.get('/api/admin/clients', requireAuth, requireAdmin, requirePermission(PERMISSIONS.CLIENTS_VIEW), async (req, res) => {
    try {
      const clients = await prisma.user.findMany({
        where: { role: 'client' },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { clientProjects: true } } },
      });
      res.json({
        ok: true,
        clients: clients.map((c) => ({
          ...serializeUser(c),
          projectCount: c._count.clientProjects,
        })),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al listar clientes' });
    }
  });

  app.get('/api/admin/clients/:id', requireAuth, requireAdmin, requirePermission(PERMISSIONS.CLIENTS_VIEW), async (req, res) => {
    const id = Number(req.params.id);
    try {
      const client = await prisma.user.findFirst({
        where: { id, role: 'client' },
        include: {
          clientProjects: { orderBy: { updatedAt: 'desc' }, include: { assignee: true } },
          conversations: {
            orderBy: { lastMessageAt: 'desc' },
            take: 10,
            include: { messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { sender: true } }, project: true },
          },
        },
      });
      if (!client) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
      const activity = await prisma.activityLog.findMany({
        where: { OR: [{ userId: id }, { entity: 'user', entityId: String(id) }] },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: true },
      });
      const activeProjects = client.clientProjects.filter((p) => !['COMPLETED', 'CANCELLED'].includes(p.status)).length;
      const completedProjects = client.clientProjects.filter((p) => p.status === 'COMPLETED').length;
      res.json({
        ok: true,
        client: {
          ...serializeUser(client),
          projects: client.clientProjects.map(serializeClientProject),
          activeProjects,
          completedProjects,
          conversations: client.conversations.map((c) => serializeConversation(c, 0)),
          activity: activity.map((l) => ({
            id: l.id,
            action: l.action,
            entity: l.entity,
            entityId: l.entityId,
            meta: parseJson(l.meta, {}),
            createdAt: l.createdAt.toISOString(),
            user: l.user ? serializeUser(l.user) : null,
          })),
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener cliente' });
    }
  });

  app.post('/api/admin/clients', requireAuth, requireAdmin, requirePermission(PERMISSIONS.CLIENTS_CREATE), async (req, res) => {
    const { email, password, firstName, lastName, phone, company, status } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ ok: false, error: 'Email y contraseña requeridos' });
    }
    try {
      const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (exists) return res.status(409).json({ ok: false, error: 'Email ya registrado' });
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: await bcrypt.hash(String(password), 10),
          role: 'client',
          status: status || 'ACTIVE',
          firstName: firstName || '',
          lastName: lastName || '',
          phone: phone || '',
          company: company || '',
          mustChangePassword: true,
        },
      });
      await logActivity(prisma, { userId: req.user.id, action: 'create_client', entity: 'user', entityId: user.id });
      res.status(201).json({ ok: true, user: serializeUser(user) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al crear cliente' });
    }
  });

  // ---------- Admin: client projects (operational) ----------
  app.get('/api/admin/client-projects', requireAuth, requireAdmin, requirePermission(PERMISSIONS.PROJECTS_VIEW), async (req, res) => {
    try {
      const clientId = req.query.clientId ? Number(req.query.clientId) : undefined;
      const where = clientId ? { clientId } : {};
      const projects = await prisma.clientProject.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: { client: true, assignee: true },
      });
      res.json({ ok: true, projects: projects.map(serializeClientProject) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al listar proyectos' });
    }
  });

  app.post('/api/admin/client-projects', requireAuth, requireAdmin, requirePermission(PERMISSIONS.PROJECTS_CREATE), async (req, res) => {
    const { clientId, title, description, status, priority, progress, assigneeId, technologies, deliverables, milestones, startDate, dueDate } = req.body || {};
    if (!clientId || !title) {
      return res.status(400).json({ ok: false, error: 'clientId y title requeridos' });
    }
    try {
      const client = await prisma.user.findFirst({ where: { id: Number(clientId), role: 'client' } });
      if (!client) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
      const project = await prisma.clientProject.create({
        data: {
          clientId: client.id,
          title: String(title),
          description: description || '',
          status: status || 'PLANNING',
          priority: priority || 'MEDIUM',
          progress: Math.max(0, Math.min(100, Number(progress) || 0)),
          assigneeId: assigneeId ? Number(assigneeId) : null,
          technologies: JSON.stringify(technologies || []),
          deliverables: JSON.stringify(deliverables || []),
          milestones: JSON.stringify(milestones || []),
          startDate: startDate ? new Date(startDate) : null,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
        include: { client: true, assignee: true },
      });
      await logActivity(prisma, { userId: req.user.id, action: 'CREATE_PROJECT', entity: 'clientProject', entityId: project.id });
      await createNotification(prisma, {
        userId: client.id,
        type: 'project_assigned',
        title: 'Nuevo proyecto asignado',
        body: project.title,
        meta: { projectId: project.id },
      });
      dispatchWebhooks(prisma, 'project.created', { projectId: project.id, clientId: client.id, title: project.title }).catch(() => {});
      sendEmail({
        to: client.email,
        template: 'projectAssigned',
        data: { projectTitle: project.title, projectId: project.id, progress: project.progress, description: project.description, url: process.env.APP_URL || '' },
      }).catch(() => {});
      res.status(201).json({ ok: true, project: serializeClientProject(project) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al crear proyecto' });
    }
  });

  app.patch('/api/admin/client-projects/:id', requireAuth, requireAdmin, requirePermission(PERMISSIONS.PROJECTS_EDIT), async (req, res) => {
    const id = Number(req.params.id);
    try {
      const existing = await prisma.clientProject.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ ok: false, error: 'Proyecto no encontrado' });
      const data = {};
      ['title', 'description', 'status', 'priority'].forEach((k) => {
        if (req.body[k] !== undefined) data[k] = req.body[k];
      });
      if (req.body.progress !== undefined) {
        data.progress = Math.max(0, Math.min(100, Number(req.body.progress) || 0));
      }
      if (req.body.clientId !== undefined) data.clientId = Number(req.body.clientId);
      if (req.body.assigneeId !== undefined) data.assigneeId = req.body.assigneeId ? Number(req.body.assigneeId) : null;
      if (req.body.status === 'COMPLETED') data.completedAt = new Date();
      if (req.body.technologies !== undefined) data.technologies = JSON.stringify(req.body.technologies);
      if (req.body.deliverables !== undefined) data.deliverables = JSON.stringify(req.body.deliverables);
      if (req.body.milestones !== undefined) data.milestones = JSON.stringify(req.body.milestones);
      if (req.body.startDate !== undefined) data.startDate = req.body.startDate ? new Date(req.body.startDate) : null;
      if (req.body.dueDate !== undefined) data.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
      const project = await prisma.clientProject.update({
        where: { id },
        data,
        include: { client: true, assignee: true },
      });
      await logActivity(prisma, { userId: req.user.id, action: 'UPDATE_PROJECT', entity: 'clientProject', entityId: id });
      await createNotification(prisma, {
        userId: project.clientId,
        type: 'project_updated',
        title: 'Proyecto actualizado',
        body: `${project.title} — ${project.progress}%`,
        meta: { projectId: project.id },
      });
      dispatchWebhooks(prisma, 'project.updated', { projectId: project.id, clientId: project.clientId, status: project.status }).catch(() => {});
      if (req.body.status !== undefined && existing.status !== project.status) {
        dispatchWebhooks(prisma, 'project.status_changed', { projectId: project.id, from: existing.status, to: project.status }).catch(() => {});
      }
      if (project.client?.email) {
        sendEmail({
          to: project.client.email,
          template: 'projectUpdated',
          data: { projectTitle: project.title, projectId: project.id, status: project.status, progress: project.progress, url: process.env.APP_URL || '' },
        }).catch(() => {});
      }
      res.json({ ok: true, project: serializeClientProject(project) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al actualizar proyecto' });
    }
  });

  app.delete('/api/admin/client-projects/:id', requireAuth, requireAdmin, requirePermission(PERMISSIONS.PROJECTS_DELETE), async (req, res) => {
    try {
      await prisma.clientProject.delete({ where: { id: Number(req.params.id) } });
      res.json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al eliminar proyecto' });
    }
  });

  // ---------- Lead → client conversion ----------
  app.post('/api/admin/leads/:id/convert', requireAuth, requireAdmin, requirePermission(PERMISSIONS.LEADS_EDIT), async (req, res) => {
    const leadId = Number(req.params.id);
    try {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead) return res.status(404).json({ ok: false, error: 'Lead no encontrado' });
      const email = lead.email.trim().toLowerCase();
      let user = await prisma.user.findUnique({ where: { email } });
      const tempPassword = req.body.password || `DesarPro${Date.now().toString(36)}`;
      if (!user) {
        const parts = lead.name.trim().split(/\s+/);
        user = await prisma.user.create({
          data: {
            email,
            passwordHash: await bcrypt.hash(tempPassword, 10),
            role: 'client',
            status: 'ACTIVE',
            firstName: parts[0] || '',
            lastName: parts.slice(1).join(' '),
            phone: lead.phone || '',
            company: lead.company || '',
            mustChangePassword: true,
          },
        });
      } else if (user.role !== 'client') {
        return res.status(409).json({ ok: false, error: 'El email pertenece a un usuario no cliente' });
      }
      await prisma.lead.update({
        where: { id: leadId },
        data: { convertedUserId: user.id, status: 'won' },
      });
      res.json({ ok: true, user: serializeUser(user), tempPassword: user.mustChangePassword ? tempPassword : undefined });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al convertir lead' });
    }
  });

  // ---------- Client portal ----------
  app.get('/api/client/dashboard', requireAuth, requireClient, async (req, res) => {
    try {
      const clientId = req.user.id;
      const [projects, conversations, unread, lastActivity, notifUnread, recentMessages] = await Promise.all([
        prisma.clientProject.findMany({ where: { clientId }, orderBy: { updatedAt: 'desc' }, include: { assignee: true } }),
        prisma.conversation.count({ where: { clientId } }),
        prisma.message.count({
          where: { conversation: { clientId }, senderId: { not: clientId }, readAt: null },
        }),
        prisma.activityLog.findFirst({ where: { userId: clientId }, orderBy: { createdAt: 'desc' } }),
        prisma.notification.count({ where: { userId: clientId, readAt: null } }),
        prisma.message.findMany({
          where: { conversation: { clientId } },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { sender: true, conversation: true },
        }),
      ]);
      const active = projects.filter((p) => !['COMPLETED', 'CANCELLED'].includes(p.status)).length;
      const completed = projects.filter((p) => p.status === 'COMPLETED').length;
      const overallProgress = projects.length
        ? Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length) : 0;
      res.json({
        ok: true,
        dashboard: {
          projects: projects.length,
          activeProjects: active,
          completedProjects: completed,
          overallProgress,
          conversations,
          unreadMessages: unread,
          unreadNotifications: notifUnread,
          lastActivity: lastActivity ? { action: lastActivity.action, createdAt: lastActivity.createdAt.toISOString() } : null,
          recentProjects: projects.slice(0, 5).map(serializeClientProject),
          recentMessages: recentMessages.map((m) => ({
            id: m.id,
            content: m.content.slice(0, 120),
            createdAt: m.createdAt.toISOString(),
            senderName: m.sender ? `${m.sender.firstName} ${m.sender.lastName}`.trim() : '',
            conversationId: m.conversationId,
          })),
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error del dashboard' });
    }
  });

  app.get('/api/client/projects', requireAuth, requireClient, async (req, res) => {
    try {
      const projects = await prisma.clientProject.findMany({
        where: { clientId: req.user.id },
        orderBy: { updatedAt: 'desc' },
        include: { assignee: true },
      });
      res.json({ ok: true, projects: projects.map(serializeClientProject) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al listar proyectos' });
    }
  });

  app.get('/api/client/projects/:id', requireAuth, requireClient, async (req, res) => {
    const id = Number(req.params.id);
    try {
      const project = await prisma.clientProject.findFirst({
        where: { id, clientId: req.user.id },
        include: { assignee: true },
      });
      if (!project) return res.status(404).json({ ok: false, error: 'Proyecto no encontrado' });
      res.json({ ok: true, project: serializeClientProject(project) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener proyecto' });
    }
  });

  app.patch('/api/client/profile', requireAuth, requireClient, async (req, res) => {
    try {
      const data = {};
      ['firstName', 'lastName', 'phone', 'company'].forEach((k) => {
        if (req.body[k] !== undefined) data[k] = req.body[k];
      });
      if (req.body.password) {
        data.passwordHash = await bcrypt.hash(String(req.body.password), 10);
        data.mustChangePassword = false;
      }
      const user = await prisma.user.update({ where: { id: req.user.id }, data });
      res.json({ ok: true, user: serializeUser(user) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al actualizar perfil' });
    }
  });

  // ---------- Conversations / messages ----------
  async function getConversationForUser(conversationId, user) {
    const c = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { client: true, project: true },
    });
    if (!c) return null;
    if (isClientRole(user.role)) {
      return c.clientId === user.id ? c : null;
    }
    if (isAdminRole(user.role)) return c;
    return null;
  }

  app.get('/api/conversations', requireAuth, async (req, res) => {
    if (isAdminRole(req.user.role) && !hasPermission(req.user, PERMISSIONS.CHAT_VIEW)) {
      return res.status(403).json({ ok: false, error: 'Permiso denegado' });
    }
    try {
      const where = isClientRole(req.user.role)
        ? { clientId: req.user.id }
        : {};
      const conversations = await prisma.conversation.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        include: {
          client: true,
          project: true,
          messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { sender: true } },
        },
      });
      const enriched = await Promise.all(conversations.map(async (c) => {
        const unread = await prisma.message.count({
          where: {
            conversationId: c.id,
            senderId: { not: req.user.id },
            readAt: null,
          },
        });
        return serializeConversation(c, unread);
      }));
      res.json({ ok: true, conversations: enriched });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al listar conversaciones' });
    }
  });

  app.post('/api/conversations', requireAuth, async (req, res) => {
    if (isAdminRole(req.user.role) && !hasPermission(req.user, PERMISSIONS.CHAT_REPLY)) {
      return res.status(403).json({ ok: false, error: 'Permiso denegado' });
    }
    const { clientId, projectId, subject, content } = req.body || {};
    try {
      let targetClientId = Number(clientId);
      if (isClientRole(req.user.role)) {
        targetClientId = req.user.id;
      } else if (!targetClientId) {
        return res.status(400).json({ ok: false, error: 'clientId requerido' });
      }
      const client = await prisma.user.findFirst({ where: { id: targetClientId, role: 'client' } });
      if (!client) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
      const conversation = await prisma.conversation.create({
        data: {
          clientId: targetClientId,
          projectId: projectId ? Number(projectId) : null,
          subject: subject || 'Consulta',
        },
      });
      if (content) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: req.user.id,
            content: String(content),
          },
        });
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date() },
        });
      }
      res.status(201).json({ ok: true, conversation: { id: conversation.id } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al crear conversación' });
    }
  });

  app.get('/api/conversations/:id/messages', requireAuth, async (req, res) => {
    if (isAdminRole(req.user.role) && !hasPermission(req.user, PERMISSIONS.CHAT_VIEW)) {
      return res.status(403).json({ ok: false, error: 'Permiso denegado' });
    }
    const id = Number(req.params.id);
    try {
      const conversation = await getConversationForUser(id, req.user);
      if (!conversation) return res.status(404).json({ ok: false, error: 'No encontrado' });
      const messages = await prisma.message.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: 'asc' },
        include: { sender: true },
      });
      res.json({ ok: true, messages: messages.map(serializeMessage) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener mensajes' });
    }
  });

  app.post('/api/conversations/:id/messages', requireAuth, async (req, res) => {
    if (isAdminRole(req.user.role) && !hasPermission(req.user, PERMISSIONS.CHAT_REPLY)) {
      return res.status(403).json({ ok: false, error: 'Permiso denegado' });
    }
    const id = Number(req.params.id);
    const content = String(req.body?.content || '').trim();
    if (!content) return res.status(400).json({ ok: false, error: 'Contenido requerido' });
    try {
      const conversation = await getConversationForUser(id, req.user);
      if (!conversation) return res.status(404).json({ ok: false, error: 'No encontrado' });
      const message = await prisma.message.create({
        data: { conversationId: id, senderId: req.user.id, content },
        include: { sender: true },
      });
      await prisma.conversation.update({ where: { id }, data: { lastMessageAt: new Date() } });
      await logActivity(prisma, { userId: req.user.id, action: 'MESSAGE_SENT', entity: 'conversation', entityId: id });
      const notifyUserId = isClientRole(req.user.role)
        ? null
        : conversation.clientId;
      if (isClientRole(req.user.role)) {
        await notifyAdmins(prisma, {
          type: 'new_message',
          title: 'Nuevo mensaje de cliente',
          body: content.slice(0, 120),
          meta: { conversationId: id, clientId: req.user.id },
        });
      } else if (notifyUserId) {
        await createNotification(prisma, {
          userId: notifyUserId,
          type: 'new_message',
          title: 'Nuevo mensaje del administrador',
          body: content.slice(0, 120),
          meta: { conversationId: id },
        });
        const clientUser = await prisma.user.findUnique({ where: { id: notifyUserId } });
        if (clientUser?.email) {
          sendEmail({
            to: clientUser.email,
            template: 'newMessage',
            data: { from: `${req.user.firstName || 'Admin'} DesarPro`, preview: content.slice(0, 200), url: process.env.APP_URL || '' },
          }).catch(() => {});
        }
      }
      dispatchWebhooks(prisma, 'message.created', { conversationId: id, messageId: message.id, senderId: req.user.id }).catch(() => {});
      res.status(201).json({ ok: true, message: serializeMessage(message) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al enviar mensaje' });
    }
  });

  app.patch('/api/conversations/:id/read', requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    try {
      const conversation = await getConversationForUser(id, req.user);
      if (!conversation) return res.status(404).json({ ok: false, error: 'No encontrado' });
      await prisma.message.updateMany({
        where: {
          conversationId: id,
          senderId: { not: req.user.id },
          readAt: null,
        },
        data: { readAt: new Date() },
      });
      res.json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al marcar leído' });
    }
  });

  app.get('/api/admin/activity', requireAuth, requireAdmin, requirePermission(PERMISSIONS.ACTIVITY_VIEW), async (req, res) => {
    try {
      const action = String(req.query.action || '').trim();
      const entity = String(req.query.entity || '').trim();
      const where = {};
      if (action) where.action = action;
      if (entity) where.entity = entity;
      const logs = await prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: { user: true },
      });
      res.json({
        ok: true,
        logs: logs.map((l) => ({
          id: l.id,
          action: l.action,
          entity: l.entity,
          entityId: l.entityId,
          meta: parseJson(l.meta, {}),
          createdAt: l.createdAt.toISOString(),
          user: l.user ? serializeUser(l.user) : null,
        })),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener actividad' });
    }
  });

  // ---------- Notifications ----------
  app.get('/api/notifications/unread-count', requireAuth, async (req, res) => {
    try {
      const unreadCount = await prisma.notification.count({
        where: { userId: req.user.id, readAt: null },
      });
      res.json({ ok: true, unreadCount });
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error' });
    }
  });

  app.get('/api/notifications', requireAuth, async (req, res) => {
    try {
      const unreadOnly = req.query.unread === '1';
      const where = { userId: req.user.id };
      if (unreadOnly) where.readAt = null;
      const [items, unreadCount] = await Promise.all([
        prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 }),
        prisma.notification.count({ where: { userId: req.user.id, readAt: null } }),
      ]);
      res.json({
        ok: true,
        notifications: items.map(serializeNotification),
        unreadCount,
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error al obtener notificaciones' });
    }
  });

  app.patch('/api/notifications/:id/read', requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    try {
      const n = await prisma.notification.findFirst({ where: { id, userId: req.user.id } });
      if (!n) return res.status(404).json({ ok: false, error: 'No encontrado' });
      await prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error' });
    }
  });

  app.patch('/api/notifications/read-all', requireAuth, async (req, res) => {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user.id, readAt: null },
        data: { readAt: new Date() },
      });
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error' });
    }
  });

  // ---------- Client approval ----------
  app.patch('/api/admin/clients/:id/status', requireAuth, requireAdmin, requirePermission(PERMISSIONS.CLIENTS_EDIT), async (req, res) => {
    const id = Number(req.params.id);
    const action = String(req.body?.action || req.body?.status || '').toUpperCase();
    const map = { APPROVE: 'ACTIVE', ACTIVE: 'ACTIVE', REJECT: 'REJECTED', REJECTED: 'REJECTED', SUSPEND: 'SUSPENDED', SUSPENDED: 'SUSPENDED', REACTIVATE: 'ACTIVE' };
    const newStatus = map[action];
    if (!newStatus) return res.status(400).json({ ok: false, error: 'Acción inválida' });
    try {
      const target = await prisma.user.findFirst({ where: { id, role: 'client' } });
      if (!target) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
      const prev = target.status;
      const user = await prisma.user.update({ where: { id }, data: { status: newStatus } });
      if (['REJECTED', 'SUSPENDED'].includes(newStatus)) await invalidateUserSessions(prisma, id);
      if (newStatus === 'ACTIVE' && prev === 'PENDING') {
        await createNotification(prisma, { userId: id, type: 'account_activated', title: 'Cuenta activada', body: 'Tu cuenta fue aprobada.', meta: {} });
        await sendEmail({ to: user.email, template: 'clientApproved', data: { name: user.firstName || user.email, url: process.env.APP_URL || '' } });
        await notifyAdmins(prisma, { type: 'client_approved', title: 'Cliente aprobado', body: user.email, meta: { userId: id } });
      }
      if (newStatus === 'REJECTED') {
        await createNotification(prisma, { userId: id, type: 'account_rejected', title: 'Registro rechazado', body: 'Tu solicitud fue rechazada.', meta: {} });
        sendEmail({ to: user.email, template: 'clientRejected', data: { name: user.firstName || user.email } }).catch(() => {});
        await notifyAdmins(prisma, { type: 'client_rejected', title: 'Cliente rechazado', body: user.email, meta: { userId: id } });
      }
      if (newStatus === 'SUSPENDED') {
        await createNotification(prisma, { userId: id, type: 'account_suspended', title: 'Cuenta suspendida', body: 'Contacta con soporte.', meta: {} });
        sendEmail({ to: user.email, template: 'clientSuspended', data: { name: user.firstName || user.email } }).catch(() => {});
        await notifyAdmins(prisma, { type: 'client_suspended', title: 'Cliente suspendido', body: user.email, meta: { userId: id } });
      }
      await logActivity(prisma, { userId: req.user.id, action: 'UPDATE_USER', entity: 'client', entityId: id, meta: { status: newStatus, action } });
      res.json({ ok: true, user: serializeUser(user) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al actualizar estado' });
    }
  });

  // ---------- General settings ----------
  const GENERAL_KEYS = ['general.identity', 'general.site', 'general.business', 'general.clients', 'general.security'];

  app.get('/api/admin/settings/general', requireAuth, requireAdmin, requirePermission(PERMISSIONS.SETTINGS_VIEW), async (_req, res) => {
    try {
      const rows = await prisma.siteConfig.findMany({ where: { key: { in: GENERAL_KEYS } } });
      const settings = {};
      GENERAL_KEYS.forEach((k) => { settings[k] = {}; });
      rows.forEach((r) => { try { settings[r.key] = JSON.parse(r.value || '{}'); } catch (e) { settings[r.key] = {}; } });
      res.json({ ok: true, settings });
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error' });
    }
  });

  app.patch('/api/admin/settings/general', requireAuth, requireAdmin, requirePermission(PERMISSIONS.SETTINGS_EDIT), async (req, res) => {
    try {
      const body = req.body || {};
      for (const key of GENERAL_KEYS) {
        if (body[key] !== undefined) {
          await prisma.siteConfig.upsert({
            where: { key },
            update: { value: JSON.stringify(body[key]) },
            create: { key, value: JSON.stringify(body[key]) },
          });
        }
      }
      const rows = await prisma.siteConfig.findMany({ where: { key: { in: GENERAL_KEYS } } });
      const settings = {};
      rows.forEach((r) => { try { settings[r.key] = JSON.parse(r.value || '{}'); } catch (e) { settings[r.key] = {}; } });
      res.json({ ok: true, settings });
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error al guardar' });
    }
  });

  // ---------- Project deliverables ----------
  function serializeDeliverable(d) {
    return {
      id: d.id, projectId: d.projectId, title: d.title, description: d.description,
      url: d.url, visible: d.visible, createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString(),
    };
  }

  app.get('/api/admin/client-projects/:id/deliverables', requireAuth, requireAdmin, requirePermission(PERMISSIONS.PROJECTS_VIEW), async (req, res) => {
    const projectId = Number(req.params.id);
    const items = await prisma.projectDeliverable.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
    res.json({ ok: true, deliverables: items.map(serializeDeliverable) });
  });

  app.post('/api/admin/client-projects/:id/deliverables', requireAuth, requireAdmin, requirePermission(PERMISSIONS.PROJECTS_EDIT), async (req, res) => {
    const projectId = Number(req.params.id);
    const { title, description, url, visible } = req.body || {};
    if (!title) return res.status(400).json({ ok: false, error: 'title requerido' });
    const project = await prisma.clientProject.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ ok: false, error: 'Proyecto no encontrado' });
    const item = await prisma.projectDeliverable.create({
      data: { projectId, title: String(title), description: description || '', url: url || '', visible: visible !== false },
    });
    if (project.clientId) {
      await createNotification(prisma, {
        userId: project.clientId,
        type: 'deliverable_available',
        title: 'Nuevo entregable',
        body: title,
        meta: { projectId, deliverableId: item.id },
      });
      const clientUser = await prisma.user.findUnique({ where: { id: project.clientId } });
      if (clientUser?.email) {
        sendEmail({
          to: clientUser.email,
          template: 'deliverableAvailable',
          data: { deliverableTitle: title, title, projectId, url: url || process.env.APP_URL || '' },
        }).catch(() => {});
      }
    }
    await logActivity(prisma, { userId: req.user.id, action: 'CREATE_DELIVERABLE', entity: 'deliverable', entityId: item.id });
    res.status(201).json({ ok: true, deliverable: serializeDeliverable(item) });
  });

  app.patch('/api/admin/deliverables/:id', requireAuth, requireAdmin, requirePermission(PERMISSIONS.PROJECTS_EDIT), async (req, res) => {
    const id = Number(req.params.id);
    const data = {};
    ['title', 'description', 'url'].forEach((k) => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
    if (req.body.visible !== undefined) data.visible = !!req.body.visible;
    const item = await prisma.projectDeliverable.update({ where: { id }, data });
    res.json({ ok: true, deliverable: serializeDeliverable(item) });
  });

  app.delete('/api/admin/deliverables/:id', requireAuth, requireAdmin, requirePermission(PERMISSIONS.PROJECTS_DELETE), async (req, res) => {
    await prisma.projectDeliverable.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  });

  app.get('/api/client/projects/:id/deliverables', requireAuth, requireClient, async (req, res) => {
    const projectId = Number(req.params.id);
    const project = await prisma.clientProject.findFirst({ where: { id: projectId, clientId: req.user.id } });
    if (!project) return res.status(404).json({ ok: false, error: 'No encontrado' });
    const items = await prisma.projectDeliverable.findMany({
      where: { projectId, visible: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ ok: true, deliverables: items.map(serializeDeliverable) });
  });
}

module.exports = { registerPortalRoutes };
