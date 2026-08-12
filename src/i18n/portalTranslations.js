// Portal i18n — guaranteed parity ES / EN / PT / FR / DE

import { EXTRA_S } from './portalTranslationsExtra.js';

const S = {
  'portal.admin.nav.dashboard': { es: 'Dashboard', en: 'Dashboard', pt: 'Dashboard', fr: 'Tableau de bord', de: 'Dashboard' },
  'portal.admin.nav.operation': { es: 'Operación', en: 'Operations', pt: 'Operação', fr: 'Opération', de: 'Betrieb' },
  'portal.admin.nav.siteContent': { es: 'Contenido del sitio', en: 'Site content', pt: 'Conteúdo do site', fr: 'Contenu du site', de: 'Website-Inhalt' },
  'portal.admin.nav.access': { es: 'Usuarios y acceso', en: 'Users & access', pt: 'Usuários e acesso', fr: 'Utilisateurs et accès', de: 'Benutzer & Zugang' },
  'portal.admin.nav.system': { es: 'Sistema', en: 'System', pt: 'Sistema', fr: 'Système', de: 'System' },
  'portal.admin.nav.clientProjects': { es: 'Proyectos clientes', en: 'Client projects', pt: 'Projetos clientes', fr: 'Projets clients', de: 'Kundenprojekte' },
  'portal.admin.nav.clients': { es: 'Clientes', en: 'Clients', pt: 'Clientes', fr: 'Clients', de: 'Kunden' },
  'portal.admin.nav.leads': { es: 'Leads', en: 'Leads', pt: 'Leads', fr: 'Leads', de: 'Leads' },
  'portal.admin.nav.messages': { es: 'Mensajes', en: 'Messages', pt: 'Mensagens', fr: 'Messages', de: 'Nachrichten' },
  'portal.admin.nav.conversations': { es: 'Conversaciones', en: 'Conversations', pt: 'Conversas', fr: 'Conversations', de: 'Unterhaltungen' },
  'portal.admin.nav.portfolio': { es: 'Portafolio público', en: 'Public portfolio', pt: 'Portfólio público', fr: 'Portfolio public', de: 'Öffentliches Portfolio' },
  'portal.admin.nav.services': { es: 'Servicios', en: 'Services', pt: 'Serviços', fr: 'Services', de: 'Dienste' },
  'portal.admin.nav.tech': { es: 'Tecnologías', en: 'Technologies', pt: 'Tecnologias', fr: 'Technologies', de: 'Technologien' },
  'portal.admin.nav.seo': { es: 'SEO', en: 'SEO', pt: 'SEO', fr: 'SEO', de: 'SEO' },
  'portal.admin.nav.users': { es: 'Usuarios', en: 'Users', pt: 'Usuários', fr: 'Utilisateurs', de: 'Benutzer' },
  'portal.admin.nav.admins': { es: 'Administradores', en: 'Administrators', pt: 'Administradores', fr: 'Administrateurs', de: 'Administratoren' },
  'portal.admin.nav.permissions': { es: 'Roles / permisos', en: 'Roles / permissions', pt: 'Funções / permissões', fr: 'Rôles / permissions', de: 'Rollen / Berechtigungen' },
  'portal.admin.nav.config': { es: 'Configuración', en: 'Settings', pt: 'Configuração', fr: 'Configuration', de: 'Einstellungen' },
  'portal.admin.nav.general': { es: 'General', en: 'General', pt: 'Geral', fr: 'Général', de: 'Allgemein' },
  'portal.admin.nav.activity': { es: 'Actividad', en: 'Activity', pt: 'Atividade', fr: 'Activité', de: 'Aktivität' },
  'portal.admin.nav.languages': { es: 'Idiomas', en: 'Languages', pt: 'Idiomas', fr: 'Langues', de: 'Sprachen' },
  'portal.admin.nav.appearance': { es: 'Apariencia', en: 'Appearance', pt: 'Aparência', fr: 'Apparence', de: 'Erscheinungsbild' },
  'portal.admin.nav.integrations': { es: 'Integraciones', en: 'Integrations', pt: 'Integrações', fr: 'Intégrations', de: 'Integrationen' },
  'portal.admin.users.title': { es: 'Usuarios', en: 'Users', pt: 'Usuários', fr: 'Utilisateurs', de: 'Benutzer' },
  'portal.admin.users.create': { es: 'Crear usuario', en: 'Create user', pt: 'Criar usuário', fr: 'Créer utilisateur', de: 'Benutzer erstellen' },
  'portal.admin.users.approve': { es: 'Aprobar', en: 'Approve', pt: 'Aprovar', fr: 'Approuver', de: 'Genehmigen' },
  'portal.admin.users.reject': { es: 'Rechazar', en: 'Reject', pt: 'Rejeitar', fr: 'Rejeter', de: 'Ablehnen' },
  'portal.admin.users.suspend': { es: 'Suspender', en: 'Suspend', pt: 'Suspender', fr: 'Suspendre', de: 'Suspendieren' },
  'portal.admin.users.reactivate': { es: 'Reactivar', en: 'Reactivate', pt: 'Reativar', fr: 'Réactiver', de: 'Reaktivieren' },
  'portal.admin.users.search': { es: 'Buscar por nombre o email…', en: 'Search by name or email…', pt: 'Buscar por nome ou email…', fr: 'Rechercher par nom ou email…', de: 'Nach Name oder E-Mail suchen…' },
  'portal.admin.users.save': { es: 'Guardar', en: 'Save', pt: 'Salvar', fr: 'Enregistrer', de: 'Speichern' },
  'portal.admin.users.filter.all': { es: 'Todos', en: 'All', pt: 'Todos', fr: 'Tous', de: 'Alle' },
  'portal.admin.clients.title': { es: 'Clientes', en: 'Clients', pt: 'Clientes', fr: 'Clients', de: 'Kunden' },
  'portal.admin.messages.unread': { es: 'sin leer', en: 'unread', pt: 'não lidas', fr: 'non lus', de: 'ungelesen' },
  'portal.admin.messages.select': { es: 'Selecciona una conversación', en: 'Select a conversation', pt: 'Selecione uma conversa', fr: 'Sélectionnez une conversation', de: 'Unterhaltung auswählen' },
  'portal.admin.notifications.title': { es: 'Notificaciones', en: 'Notifications', pt: 'Notificações', fr: 'Notifications', de: 'Benachrichtigungen' },
  'portal.admin.notifications.empty': { es: 'Sin notificaciones', en: 'No notifications', pt: 'Sem notificações', fr: 'Aucune notification', de: 'Keine Benachrichtigungen' },
  'portal.admin.notifications.markAll': { es: 'Marcar todas leídas', en: 'Mark all read', pt: 'Marcar todas lidas', fr: 'Tout marquer lu', de: 'Alle als gelesen markieren' },
  'portal.admin.integrations.active': { es: 'Configurado', en: 'Configured', pt: 'Configurado', fr: 'Configuré', de: 'Konfiguriert' },
  'portal.admin.integrations.inactive': { es: 'No configurado', en: 'Not configured', pt: 'Não configurado', fr: 'Non configuré', de: 'Nicht konfiguriert' },
  'portal.admin.integrations.testEmail': { es: 'Enviar correo de prueba', en: 'Send test email', pt: 'Enviar e-mail de teste', fr: 'Envoyer e-mail test', de: 'Test-E-Mail senden' },
  'portal.admin.integrations.webhooks': { es: 'Webhooks', en: 'Webhooks', pt: 'Webhooks', fr: 'Webhooks', de: 'Webhooks' },
  'portal.admin.integrations.analytics': { es: 'Google Analytics', en: 'Google Analytics', pt: 'Google Analytics', fr: 'Google Analytics', de: 'Google Analytics' },
  'portal.admin.integrations.meta': { es: 'Meta Pixel', en: 'Meta Pixel', pt: 'Meta Pixel', fr: 'Meta Pixel', de: 'Meta Pixel' },
  'portal.admin.settings.saved': { es: 'Configuración guardada', en: 'Settings saved', pt: 'Configuração salva', fr: 'Configuration enregistrée', de: 'Einstellungen gespeichert' },
  'portal.auth.forgotTitle': { es: 'Recuperar contraseña', en: 'Recover password', pt: 'Recuperar senha', fr: 'Récupérer mot de passe', de: 'Passwort wiederherstellen' },
  'portal.auth.forgotDesc': { es: 'Introduce tu email y te enviaremos un enlace si la cuenta existe.', en: 'Enter your email and we will send a link if the account exists.', pt: 'Introduza seu email e enviaremos um link se a conta existir.', fr: 'Entrez votre email et nous enverrons un lien si le compte existe.', de: 'Geben Sie Ihre E-Mail ein. Bei vorhandenem Konto senden wir einen Link.' },
  'portal.auth.forgotSubmit': { es: 'Enviar enlace', en: 'Send link', pt: 'Enviar link', fr: 'Envoyer le lien', de: 'Link senden' },
  'portal.auth.forgotSent': { es: 'Si el email existe, recibirás instrucciones en breve.', en: 'If the email exists, you will receive instructions shortly.', pt: 'Se o email existir, receberá instruções em breve.', fr: 'Si l\'email existe, vous recevrez des instructions.', de: 'Falls die E-Mail existiert, erhalten Sie Anweisungen.' },
  'portal.auth.resetTitle': { es: 'Nueva contraseña', en: 'New password', pt: 'Nova senha', fr: 'Nouveau mot de passe', de: 'Neues Passwort' },
  'portal.auth.resetSuccess': { es: 'Contraseña actualizada correctamente.', en: 'Password updated successfully.', pt: 'Senha atualizada com sucesso.', fr: 'Mot de passe mis à jour.', de: 'Passwort erfolgreich aktualisiert.' },
  'portal.auth.tokenInvalid': { es: 'El enlace no es válido o ha expirado.', en: 'The link is invalid or expired.', pt: 'O link é inválido ou expirou.', fr: 'Le lien est invalide ou expiré.', de: 'Der Link ist ungültig oder abgelaufen.' },
  'portal.auth.backLogin': { es: 'Volver al login', en: 'Back to login', pt: 'Voltar ao login', fr: 'Retour connexion', de: 'Zurück zum Login' },
  'portal.auth.registerPending': { es: 'Registro recibido. Un administrador activará tu cuenta pronto.', en: 'Registration received. An admin will activate your account soon.', pt: 'Registro recebido. Um administrador ativará sua conta em breve.', fr: 'Inscription reçue. Un admin activera votre compte.', de: 'Registrierung erhalten. Ein Admin aktiviert Ihr Konto.' },
  'portal.auth.pendingApproval': { es: 'Tu cuenta está pendiente de aprobación.', en: 'Your account is pending approval.', pt: 'Sua conta está pendente de aprovação.', fr: 'Votre compte est en attente d\'approbation.', de: 'Ihr Konto wartet auf Freigabe.' },
  'portal.auth.accountBlocked': { es: 'Cuenta inactiva o bloqueada.', en: 'Account inactive or blocked.', pt: 'Conta inativa ou bloqueada.', fr: 'Compte inactif ou bloqué.', de: 'Konto inaktiv oder gesperrt.' },
  'portal.auth.accountRejected': { es: 'Registro rechazado.', en: 'Registration rejected.', pt: 'Registro rejeitado.', fr: 'Inscription rejetée.', de: 'Registrierung abgelehnt.' },
  'portal.auth.accountSuspended': { es: 'Cuenta suspendida.', en: 'Account suspended.', pt: 'Conta suspensa.', fr: 'Compte suspendu.', de: 'Konto suspendiert.' },
  'portal.auth.emailExists': { es: 'Este email ya está registrado', en: 'This email is already registered', pt: 'Este email já está registrado', fr: 'Cet email est déjà enregistré', de: 'Diese E-Mail ist bereits registriert' },
  'portal.register.passwordMin': { es: 'Mínimo 6 caracteres', en: 'Minimum 6 characters', pt: 'Mínimo 6 caracteres', fr: 'Minimum 6 caractères', de: 'Mindestens 6 Zeichen' },
  'portal.register.passwordMismatch': { es: 'Las contraseñas no coinciden', en: 'Passwords do not match', pt: 'As senhas não coincidem', fr: 'Les mots de passe ne correspondent pas', de: 'Passwörter stimmen nicht überein' },
  'portal.client.hello': { es: 'Hola', en: 'Hello', pt: 'Olá', fr: 'Bonjour', de: 'Hallo' },
  'portal.client.welcome': { es: 'Resumen de tu cuenta', en: 'Account overview', pt: 'Resumo da sua conta', fr: 'Aperçu du compte', de: 'Kontenübersicht' },
  'portal.client.deliverables': { es: 'Entregables', en: 'Deliverables', pt: 'Entregáveis', fr: 'Livrables', de: 'Lieferungen' },
  'portal.client.recentMessages': { es: 'Mensajes recientes', en: 'Recent messages', pt: 'Mensagens recentes', fr: 'Messages récents', de: 'Aktuelle Nachrichten' },
  'portal.client.noDeliverables': { es: 'Sin entregables disponibles', en: 'No deliverables available', pt: 'Sem entregáveis disponíveis', fr: 'Aucun livrable disponible', de: 'Keine Lieferungen verfügbar' },
  'portal.client.nextSteps': { es: 'Próximos pasos', en: 'Next steps', pt: 'Próximos passos', fr: 'Prochaines étapes', de: 'Nächste Schritte' },
  'portal.status.PENDING': { es: 'Pendiente', en: 'Pending', pt: 'Pendente', fr: 'En attente', de: 'Ausstehend' },
  'portal.status.ACTIVE': { es: 'Activo', en: 'Active', pt: 'Ativo', fr: 'Actif', de: 'Aktiv' },
  'portal.status.REJECTED': { es: 'Rechazado', en: 'Rejected', pt: 'Rejeitado', fr: 'Rejeté', de: 'Abgelehnt' },
  'portal.status.SUSPENDED': { es: 'Suspendido', en: 'Suspended', pt: 'Suspenso', fr: 'Suspendu', de: 'Suspendiert' },
  'portal.projectStatus.PENDING': { es: 'Pendiente', en: 'Pending', pt: 'Pendente', fr: 'En attente', de: 'Ausstehend' },
  'portal.projectStatus.PLANNING': { es: 'Planificación', en: 'Planning', pt: 'Planejamento', fr: 'Planification', de: 'Planung' },
  'portal.projectStatus.IN_PROGRESS': { es: 'En progreso', en: 'In progress', pt: 'Em progresso', fr: 'En cours', de: 'In Bearbeitung' },
  'portal.projectStatus.REVIEW': { es: 'En revisión', en: 'In review', pt: 'Em revisão', fr: 'En révision', de: 'In Prüfung' },
  'portal.projectStatus.COMPLETED': { es: 'Finalizado', en: 'Completed', pt: 'Concluído', fr: 'Terminé', de: 'Abgeschlossen' },
  'portal.projectStatus.PAUSED': { es: 'Pausado', en: 'Paused', pt: 'Pausado', fr: 'En pause', de: 'Pausiert' },
  'portal.projectStatus.CANCELLED': { es: 'Cancelado', en: 'Cancelled', pt: 'Cancelado', fr: 'Annulé', de: 'Abgebrochen' },
  'portal.projectStatus.DEVELOPMENT': { es: 'En desarrollo', en: 'In development', pt: 'Em desenvolvimento', fr: 'En développement', de: 'In Entwicklung' },
  'portal.projectStatus.TESTING': { es: 'En revisión', en: 'In review', pt: 'Em revisão', fr: 'En révision', de: 'In Prüfung' },
  'portal.errors.notFound': { es: 'No encontrado', en: 'Not found', pt: 'Não encontrado', fr: 'Introuvable', de: 'Nicht gefunden' },
  'portal.errors.forbidden': { es: 'Acceso denegado', en: 'Access denied', pt: 'Acesso negado', fr: 'Accès refusé', de: 'Zugriff verweigert' },
  ...EXTRA_S,
};

function nest(flat) {
  const root = {};
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split('.');
    let cur = root;
    for (let i = 0; i < parts.length - 1; i++) {
      cur[parts[i]] = cur[parts[i]] || {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }
  return root;
}

function buildLang(lang) {
  const flat = {};
  for (const [key, tr] of Object.entries(S)) flat[key] = tr[lang];
  return nest(flat);
}

export const PORTAL_I18N = {
  es: buildLang('es'),
  en: buildLang('en'),
  pt: buildLang('pt'),
  fr: buildLang('fr'),
  de: buildLang('de'),
};

export const PORTAL_I18N_KEYS = Object.keys(S);
