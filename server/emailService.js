// Email service — SMTP via nodemailer when configured; graceful skip otherwise.

let transporter = null;
let configured = false;

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || user || 'noreply@desarpro.com';
  if (!host || !user || !pass) return null;
  return { host, port, secure: port === 465, auth: { user, pass }, from };
}

function initEmail() {
  const cfg = getSmtpConfig();
  if (!cfg) {
    configured = false;
    transporter = null;
    return { configured: false };
  }
  try {
    // eslint-disable-next-line global-require
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: cfg.auth,
    });
    configured = true;
    return { configured: true, from: cfg.from };
  } catch (e) {
    console.warn('[email] nodemailer not available:', e.message);
    configured = false;
    transporter = null;
    return { configured: false, error: e.message };
  }
}

function emailStatus() {
  const cfg = getSmtpConfig();
  return {
    configured: configured && !!transporter,
    host: cfg ? cfg.host : null,
    port: cfg ? cfg.port : null,
    user: cfg ? cfg.auth.user : null,
    from: cfg ? cfg.from : null,
    hasCredentials: !!(cfg && cfg.auth.user && cfg.auth.pass),
  };
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function emailLayout({ title, intro, bodyHtml, ctaLabel, ctaUrl }) {
  const btn = ctaLabel && ctaUrl
    ? `<p style="margin:28px 0 0"><a href="${esc(ctaUrl)}" style="display:inline-block;padding:12px 24px;background:#1e293b;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">${esc(ctaLabel)}</a></p>`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px"><tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
<tr><td style="padding:28px 32px 20px;border-bottom:1px solid #e2e8f0">
<span style="font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.02em">DesarPro</span>
</td></tr>
<tr><td style="padding:32px">
<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3">${esc(title)}</h1>
${intro ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569">${intro}</p>` : ''}
<div style="font-size:15px;line-height:1.6;color:#334155">${bodyHtml}</div>
${btn}
</td></tr>
<tr><td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0">
<p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5">DesarPro · Soluciones tecnológicas<br>Este correo fue enviado automáticamente. No respondas a este mensaje.</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

const COPY = {
  es: {
    welcomeSubject: (n) => `Bienvenido a DesarPro, ${n}`,
    welcomeTitle: 'Registro recibido',
    welcomeIntro: (n) => `Hola ${n}, hemos recibido tu solicitud de registro.`,
    welcomeBody: 'Un administrador revisará tu cuenta. Te avisaremos por correo cuando puedas acceder al portal cliente.',
    approvedSubject: 'Tu cuenta DesarPro ha sido activada',
    approvedTitle: 'Cuenta activada',
    approvedBody: 'Tu solicitud fue aprobada. Ya puedes iniciar sesión en el portal cliente.',
    rejectedSubject: 'Actualización sobre tu registro en DesarPro',
    rejectedTitle: 'Registro no aprobado',
    rejectedBody: 'Lamentablemente tu solicitud de registro no fue aprobada. Si crees que es un error, contacta con soporte.',
    suspendedSubject: 'Tu cuenta DesarPro ha sido suspendida',
    suspendedTitle: 'Cuenta suspendida',
    suspendedBody: 'Tu acceso al portal ha sido suspendido temporalmente. Contacta con soporte para más información.',
    projectAssignedSubject: (t) => `Nuevo proyecto: ${t}`,
    projectAssignedTitle: 'Proyecto asignado',
    projectUpdatedSubject: (t) => `Proyecto actualizado: ${t}`,
    projectUpdatedTitle: 'Actualización de proyecto',
    deliverableSubject: (t) => `Nuevo entregable: ${t}`,
    deliverableTitle: 'Entregable disponible',
    messageSubject: 'Nuevo mensaje en DesarPro',
    messageTitle: 'Tienes un nuevo mensaje',
    resetSubject: 'Restablecer contraseña — DesarPro',
    resetTitle: 'Restablecer contraseña',
    resetBody: 'Haz clic en el botón para crear una nueva contraseña. El enlace expira en 1 hora.',
    resetDoneSubject: 'Contraseña actualizada — DesarPro',
    resetDoneTitle: 'Contraseña actualizada',
    resetDoneBody: 'Tu contraseña fue cambiada correctamente. Si no fuiste tú, contacta con soporte de inmediato.',
    ctaLogin: 'Iniciar sesión',
    ctaPortal: 'Ir al portal',
    ctaReset: 'Restablecer contraseña',
  },
  en: {
    welcomeSubject: (n) => `Welcome to DesarPro, ${n}`,
    welcomeTitle: 'Registration received',
    welcomeIntro: (n) => `Hello ${n}, we received your registration request.`,
    welcomeBody: 'An administrator will review your account. We will email you when you can access the client portal.',
    approvedSubject: 'Your DesarPro account is active',
    approvedTitle: 'Account activated',
    approvedBody: 'Your request was approved. You can now sign in to the client portal.',
    rejectedSubject: 'Update on your DesarPro registration',
    rejectedTitle: 'Registration not approved',
    rejectedBody: 'Unfortunately your registration was not approved. Contact support if you believe this is an error.',
    suspendedSubject: 'Your DesarPro account has been suspended',
    suspendedTitle: 'Account suspended',
    suspendedBody: 'Your portal access has been temporarily suspended. Contact support for more information.',
    projectAssignedSubject: (t) => `New project: ${t}`,
    projectAssignedTitle: 'Project assigned',
    projectUpdatedSubject: (t) => `Project updated: ${t}`,
    projectUpdatedTitle: 'Project update',
    deliverableSubject: (t) => `New deliverable: ${t}`,
    deliverableTitle: 'Deliverable available',
    messageSubject: 'New message on DesarPro',
    messageTitle: 'You have a new message',
    resetSubject: 'Reset password — DesarPro',
    resetTitle: 'Reset password',
    resetBody: 'Click the button to create a new password. The link expires in 1 hour.',
    resetDoneSubject: 'Password updated — DesarPro',
    resetDoneTitle: 'Password updated',
    resetDoneBody: 'Your password was changed successfully. If this was not you, contact support immediately.',
    ctaLogin: 'Sign in',
    ctaPortal: 'Go to portal',
    ctaReset: 'Reset password',
  },
};

function L(lang) {
  return COPY[lang] || COPY.es;
}

function baseUrl(data) {
  return (data.url || process.env.APP_URL || process.env.FRONTEND_URL || '').replace(/\/+$/, '');
}

const TEMPLATES = {
  welcome: (data) => {
    const c = L(data.lang);
    const name = data.name || 'Usuario';
    return {
      subject: c.welcomeSubject(name),
      text: `${c.welcomeIntro(name)} ${c.welcomeBody}`,
      html: emailLayout({ title: c.welcomeTitle, intro: c.welcomeIntro(name), bodyHtml: `<p>${esc(c.welcomeBody)}</p>`, ctaLabel: c.ctaLogin, ctaUrl: `${baseUrl(data)}/#/login` }),
    };
  },
  clientApproved: (data) => {
    const c = L(data.lang);
    return {
      subject: c.approvedSubject,
      text: c.approvedBody,
      html: emailLayout({ title: c.approvedTitle, intro: data.name ? `Hola ${data.name},` : '', bodyHtml: `<p>${esc(c.approvedBody)}</p>`, ctaLabel: c.ctaPortal, ctaUrl: `${baseUrl(data)}/#/login` }),
    };
  },
  clientRejected: (data) => {
    const c = L(data.lang);
    return {
      subject: c.rejectedSubject,
      text: c.rejectedBody,
      html: emailLayout({ title: c.rejectedTitle, bodyHtml: `<p>${esc(c.rejectedBody)}</p>` }),
    };
  },
  clientSuspended: (data) => {
    const c = L(data.lang);
    return {
      subject: c.suspendedSubject,
      text: c.suspendedBody,
      html: emailLayout({ title: c.suspendedTitle, bodyHtml: `<p>${esc(c.suspendedBody)}</p>` }),
    };
  },
  projectAssigned: (data) => {
    const c = L(data.lang);
    const title = data.projectTitle || 'Proyecto';
    return {
      subject: c.projectAssignedSubject(title),
      text: `Proyecto: ${title}. Progreso: ${data.progress ?? 0}%`,
      html: emailLayout({
        title: c.projectAssignedTitle,
        bodyHtml: `<p><strong>${esc(title)}</strong></p><p>${esc(data.description || '')}</p>`,
        ctaLabel: c.ctaPortal,
        ctaUrl: data.projectUrl || `${baseUrl(data)}/#/client/projects/${data.projectId || ''}`,
      }),
    };
  },
  projectUpdated: (data) => {
    const c = L(data.lang);
    const title = data.projectTitle || 'Proyecto';
    return {
      subject: c.projectUpdatedSubject(title),
      text: `${title} — ${data.status || ''} — ${data.progress ?? 0}%`,
      html: emailLayout({
        title: c.projectUpdatedTitle,
        bodyHtml: `<p><strong>${esc(title)}</strong></p><p>Estado: ${esc(data.status || '—')} · Progreso: ${data.progress ?? 0}%</p>`,
        ctaLabel: c.ctaPortal,
        ctaUrl: data.projectUrl || `${baseUrl(data)}/#/client/projects/${data.projectId || ''}`,
      }),
    };
  },
  deliverableAvailable: (data) => {
    const c = L(data.lang);
    const title = data.deliverableTitle || data.title || 'Entregable';
    return {
      subject: c.deliverableSubject(title),
      text: `Nuevo entregable: ${title}`,
      html: emailLayout({
        title: c.deliverableTitle,
        bodyHtml: `<p><strong>${esc(title)}</strong></p>${data.url ? `<p><a href="${esc(data.url)}">${esc(data.url)}</a></p>` : ''}`,
        ctaLabel: c.ctaPortal,
        ctaUrl: `${baseUrl(data)}/#/client/projects/${data.projectId || ''}`,
      }),
    };
  },
  newMessage: (data) => {
    const c = L(data.lang);
    return {
      subject: c.messageSubject,
      text: `${data.from}: ${data.preview}`,
      html: emailLayout({
        title: c.messageTitle,
        bodyHtml: `<p><strong>${esc(data.from || 'DesarPro')}</strong></p><p style="background:#f1f5f9;padding:12px 16px;border-radius:8px">${esc(data.preview || '')}</p>`,
        ctaLabel: c.ctaPortal,
        ctaUrl: `${baseUrl(data)}/#/client/messages`,
      }),
    };
  },
  passwordReset: (data) => {
    const c = L(data.lang);
    return {
      subject: c.resetSubject,
      text: `${c.resetBody} ${data.url}`,
      html: emailLayout({ title: c.resetTitle, bodyHtml: `<p>${esc(c.resetBody)}</p>`, ctaLabel: c.ctaReset, ctaUrl: data.url }),
    };
  },
  passwordResetComplete: (data) => {
    const c = L(data.lang);
    return {
      subject: c.resetDoneSubject,
      text: c.resetDoneBody,
      html: emailLayout({ title: c.resetDoneTitle, bodyHtml: `<p>${esc(c.resetDoneBody)}</p>`, ctaLabel: c.ctaLogin, ctaUrl: `${baseUrl(data)}/#/login` }),
    };
  },
};

async function verifySmtpConnection() {
  if (!transporter) initEmail();
  if (!transporter || !configured) return { ok: false, skipped: true, reason: 'smtp_not_configured' };
  try {
    await transporter.verify();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function sendEmail({ to, template, data = {} }) {
  if (!to) return { ok: false, skipped: true, reason: 'no_recipient' };
  if (!transporter) initEmail();
  if (!transporter || !configured) {
    console.info(`[email] skipped (${template}) → ${to} — SMTP not configured`);
    return { ok: false, skipped: true, reason: 'smtp_not_configured' };
  }
  const cfg = getSmtpConfig();
  const tpl = TEMPLATES[template];
  if (!tpl) return { ok: false, error: 'unknown_template' };
  const { subject, text, html } = tpl(data);
  try {
    await transporter.sendMail({ from: cfg.from, to, subject, text, html });
    return { ok: true };
  } catch (e) {
    console.error('[email] send failed:', e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { initEmail, emailStatus, sendEmail, verifySmtpConnection, getSmtpConfig };
