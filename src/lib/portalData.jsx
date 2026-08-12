// portalData — users, clients, client projects, messaging, client dashboard.

import { resolveApiBase } from './apiBase.js';
import { readToken } from './authSession.js';

async function apiReq(path, opts = {}) {
  const base = resolveApiBase();
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = readToken();
  if (token) headers['x-admin-token'] = token;
  try {
    const res = await fetch(`${base}${path}`, {
      method: opts.method || 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch (e) {}
    return { status: res.status, ok: res.ok, data };
  } catch (e) {
    return { status: 0, ok: false, data: null };
  }
}

async function registerAccount(payload) {
  const res = await apiReq('/api/auth/register', { method: 'POST', body: payload });
  return { ok: res.ok && res.data?.ok, status: res.status, data: res.data, error: res.data?.error };
}

async function fetchMe() {
  const res = await apiReq('/api/auth/me');
  return res.ok && res.data?.user ? res.data.user : null;
}

async function loginAccount(email, password) {
  const res = await apiReq('/api/login', { method: 'POST', body: { email, password } });
  return { ok: res.ok && res.data?.ok, status: res.status, data: res.data, error: res.data?.error, message: res.data?.message };
}

async function fetchAdminUsers(q = '', role = '', status = '', page = 1, limit = 25) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (role) params.set('role', role);
  if (status) params.set('status', status);
  params.set('page', String(page));
  params.set('limit', String(limit));
  const res = await apiReq(`/api/admin/users?${params}`);
  return res.ok && res.data ? { users: res.data.users || [], total: res.data.total || 0 } : { users: [], total: 0 };
}

async function fetchAdminUser(id) {
  const res = await apiReq(`/api/admin/users/${id}`);
  return res.ok ? res.data?.user : null;
}

async function resetUserPassword(id, password) {
  const res = await apiReq(`/api/admin/users/${id}/reset-password`, { method: 'POST', body: password ? { password } : {} });
  return { ok: res.ok && res.data?.ok, tempPassword: res.data?.tempPassword, error: res.data?.error };
}

async function createAdminUser(body) {
  const res = await apiReq('/api/admin/users', { method: 'POST', body });
  return { ok: res.ok && res.data?.ok, status: res.status, user: res.data?.user, error: res.data?.error };
}

async function updateAdminUser(id, patch) {
  const res = await apiReq(`/api/admin/users/${id}`, { method: 'PATCH', body: patch });
  return { ok: res.ok && res.data?.ok, status: res.status, user: res.data?.user, error: res.data?.error };
}

async function deleteAdminUser(id) {
  const res = await apiReq(`/api/admin/users/${id}`, { method: 'DELETE' });
  return { ok: res.ok && res.data?.ok !== false, status: res.status };
}

async function fetchAdminClients() {
  const res = await apiReq('/api/admin/clients');
  return res.ok && res.data?.clients ? res.data.clients : [];
}

async function fetchAdminClient(id) {
  const res = await apiReq(`/api/admin/clients/${id}`);
  return res.ok ? res.data?.client : null;
}

async function createAdminClient(body) {
  const res = await apiReq('/api/admin/clients', { method: 'POST', body });
  return { ok: res.ok && res.data?.ok, status: res.status, user: res.data?.user, error: res.data?.error };
}

async function convertLeadToClient(leadId, password) {
  const res = await apiReq(`/api/admin/leads/${leadId}/convert`, { method: 'POST', body: { password } });
  return { ok: res.ok && res.data?.ok, data: res.data, error: res.data?.error };
}

async function fetchAdminClientProjects(clientId) {
  const q = clientId ? `?clientId=${clientId}` : '';
  const res = await apiReq(`/api/admin/client-projects${q}`);
  return res.ok && res.data?.projects ? res.data.projects : [];
}

async function saveAdminClientProject(body) {
  const res = await apiReq('/api/admin/client-projects', { method: 'POST', body });
  return { ok: res.ok && res.data?.ok, project: res.data?.project, error: res.data?.error };
}

async function updateAdminClientProject(id, patch) {
  const res = await apiReq(`/api/admin/client-projects/${id}`, { method: 'PATCH', body: patch });
  return { ok: res.ok && res.data?.ok, project: res.data?.project, error: res.data?.error };
}

async function deleteAdminClientProject(id) {
  const res = await apiReq(`/api/admin/client-projects/${id}`, { method: 'DELETE' });
  return { ok: res.ok && res.data?.ok !== false };
}

async function fetchConversations() {
  const res = await apiReq('/api/conversations');
  return res.ok && res.data?.conversations ? res.data.conversations : [];
}

async function createConversation(body) {
  const res = await apiReq('/api/conversations', { method: 'POST', body });
  return { ok: res.ok && res.data?.ok, conversation: res.data?.conversation, error: res.data?.error };
}

async function fetchConversationMessages(id) {
  const res = await apiReq(`/api/conversations/${id}/messages`);
  return res.ok && res.data?.messages ? res.data.messages : [];
}

async function sendMessage(conversationId, content) {
  const res = await apiReq(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { content },
  });
  return { ok: res.ok && res.data?.ok, message: res.data?.message, error: res.data?.error };
}

async function markConversationRead(id) {
  const res = await apiReq(`/api/conversations/${id}/read`, { method: 'PATCH' });
  return res.ok && res.data?.ok;
}

async function fetchClientDashboard() {
  const res = await apiReq('/api/client/dashboard');
  return res.ok ? res.data?.dashboard : null;
}

async function fetchClientProjects() {
  const res = await apiReq('/api/client/projects');
  return res.ok && res.data?.projects ? res.data.projects : [];
}

async function fetchClientProject(id) {
  const res = await apiReq(`/api/client/projects/${id}`);
  return res.ok ? res.data?.project : null;
}

async function updateClientProfile(patch) {
  const res = await apiReq('/api/client/profile', { method: 'PATCH', body: patch });
  return { ok: res.ok && res.data?.ok, user: res.data?.user, error: res.data?.error };
}

async function fetchActivityLogs(action = '') {
  const q = action ? `?action=${encodeURIComponent(action)}` : '';
  const res = await apiReq(`/api/admin/activity${q}`);
  return res.ok && res.data?.logs ? res.data.logs : [];
}

async function fetchNotifications() {
  const res = await apiReq('/api/notifications');
  return res.ok && res.data ? { notifications: res.data.notifications || [], unreadCount: res.data.unreadCount || 0 } : { notifications: [], unreadCount: 0 };
}

async function markNotificationRead(id) {
  const res = await apiReq(`/api/notifications/${id}/read`, { method: 'PATCH' });
  return res.ok && res.data?.ok;
}

async function markAllNotificationsRead() {
  const res = await apiReq('/api/notifications/read-all', { method: 'PATCH' });
  return res.ok && res.data?.ok;
}

async function updateClientStatus(id, action) {
  const res = await apiReq(`/api/admin/clients/${id}/status`, { method: 'PATCH', body: { action } });
  return { ok: res.ok && res.data?.ok, user: res.data?.user, error: res.data?.error };
}

async function fetchGeneralSettings() {
  const res = await apiReq('/api/admin/settings/general');
  return res.ok ? res.data?.settings : null;
}

async function saveGeneralSettings(patch) {
  const res = await apiReq('/api/admin/settings/general', { method: 'PATCH', body: patch });
  return { ok: res.ok && res.data?.ok, settings: res.data?.settings, error: res.data?.error };
}

async function testEmailIntegration(email) {
  const res = await apiReq('/api/admin/integrations/email/test', { method: 'POST', body: email ? { email } : {} });
  return { ok: res.ok && res.data?.ok, skipped: res.data?.skipped, message: res.data?.message, error: res.data?.error };
}

async function saveAnalyticsIntegration(body) {
  const res = await apiReq('/api/admin/integrations/analytics', { method: 'PATCH', body });
  return { ok: res.ok && res.data?.ok, analytics: res.data?.analytics };
}

async function saveMetaIntegration(body) {
  const res = await apiReq('/api/admin/integrations/meta', { method: 'PATCH', body });
  return { ok: res.ok && res.data?.ok, meta: res.data?.meta };
}

async function fetchWebhooks() {
  const res = await apiReq('/api/admin/webhooks');
  return res.ok && res.data?.webhooks ? res.data.webhooks : [];
}

async function createWebhook(body) {
  const res = await apiReq('/api/admin/webhooks', { method: 'POST', body });
  return { ok: res.ok && res.data?.ok, webhook: res.data?.webhook, error: res.data?.error };
}

async function updateWebhook(id, body) {
  const res = await apiReq(`/api/admin/webhooks/${id}`, { method: 'PATCH', body });
  return { ok: res.ok && res.data?.ok, webhook: res.data?.webhook, error: res.data?.error };
}

async function deleteWebhook(id) {
  const res = await apiReq(`/api/admin/webhooks/${id}`, { method: 'DELETE' });
  return res.ok && res.data?.ok;
}

async function fetchProjectDeliverables(projectId, admin = true) {
  const path = admin ? `/api/admin/client-projects/${projectId}/deliverables` : `/api/client/projects/${projectId}/deliverables`;
  const res = await apiReq(path);
  return res.ok && res.data?.deliverables ? res.data.deliverables : [];
}

async function createProjectDeliverable(projectId, body) {
  const res = await apiReq(`/api/admin/client-projects/${projectId}/deliverables`, { method: 'POST', body });
  return { ok: res.ok && res.data?.ok, deliverable: res.data?.deliverable, error: res.data?.error };
}

async function updateProjectDeliverable(id, body) {
  const res = await apiReq(`/api/admin/deliverables/${id}`, { method: 'PATCH', body });
  return { ok: res.ok && res.data?.ok, deliverable: res.data?.deliverable, error: res.data?.error };
}

async function deleteProjectDeliverable(id) {
  const res = await apiReq(`/api/admin/deliverables/${id}`, { method: 'DELETE' });
  return res.ok && res.data?.ok;
}

async function fetchNotificationUnreadCount() {
  const res = await apiReq('/api/notifications/unread-count');
  return res.ok ? (res.data?.unreadCount || 0) : 0;
}

async function requestPasswordReset(email) {
  const res = await apiReq('/api/auth/forgot-password', { method: 'POST', body: { email } });
  return { ok: res.ok && res.data?.ok, message: res.data?.message, error: res.data?.error };
}

async function validateResetToken(token) {
  const res = await apiReq(`/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`);
  return res.ok && res.data?.valid;
}

async function resetPassword(token, password, passwordConfirm) {
  const res = await apiReq('/api/auth/reset-password', { method: 'POST', body: { token, password, passwordConfirm } });
  return { ok: res.ok && res.data?.ok, message: res.data?.message, error: res.data?.error };
}

async function fetchIntegrationsStatus() {
  const res = await apiReq('/api/admin/integrations/status');
  return res.ok ? res.data?.integrations : null;
}

export {
  registerAccount,
  fetchMe,
  loginAccount,
  fetchAdminUsers,
  fetchAdminUser,
  resetUserPassword,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  fetchAdminClients,
  fetchAdminClient,
  createAdminClient,
  convertLeadToClient,
  fetchAdminClientProjects,
  saveAdminClientProject,
  updateAdminClientProject,
  deleteAdminClientProject,
  fetchConversations,
  createConversation,
  fetchConversationMessages,
  sendMessage,
  markConversationRead,
  fetchClientDashboard,
  fetchClientProjects,
  fetchClientProject,
  updateClientProfile,
  fetchActivityLogs,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  fetchNotificationUnreadCount,
  requestPasswordReset,
  validateResetToken,
  resetPassword,
  fetchIntegrationsStatus,
  updateClientStatus,
  fetchGeneralSettings,
  saveGeneralSettings,
  testEmailIntegration,
  saveAnalyticsIntegration,
  saveMetaIntegration,
  fetchWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  fetchProjectDeliverables,
  createProjectDeliverable,
  updateProjectDeliverable,
  deleteProjectDeliverable,
};
