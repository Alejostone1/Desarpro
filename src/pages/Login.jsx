// Login — rotating Earth globe scene + form panel. Includes admin login mode.

import React from 'react';
import { useAdmin, Editable } from '../lib/admin.jsx';
import { useTranslations, useI18n } from '../i18n/index.jsx';
import { registerAccount, loginAccount, requestPasswordReset } from '../lib/portalData.jsx';
import { writeToken, writeUser, isAdminUser, isClientUser } from '../lib/authSession.js';
import { Reveal } from '../lib/anim.jsx';
import Icon from '../lib/icons.jsx';
import Logo from '../components/Logo.jsx';
import EarthGlobeScene from '../components/EarthGlobeScene.jsx';

function FormField({ label, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
      {children}
    </label>
  );
}

function Login({ setRoute }) {
  const { login: adminLogin, isAdmin } = useAdmin();
  const t = useTranslations();
  const { t: tp } = useI18n();
  const [mode, setMode] = React.useState('login'); // login | register | admin | forgot
  const [pendingMsg, setPendingMsg] = React.useState('');
  const [data, setData] = React.useState({ email: '', password: '', passwordConfirm: '', name: '', company: '', phone: '', remember: true });
  const [adminPwd, setAdminPwd] = React.useState('');
  const [adminError, setAdminError] = React.useState('');
  const [adminSuccess, setAdminSuccess] = React.useState(false);
  const [formError, setFormError] = React.useState('');
  const [formSuccess, setFormSuccess] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Redirect away from login if already admin (and user picks admin route)
  React.useEffect(() => {
    if (adminSuccess && isAdmin) {
      const timer = setTimeout(() => setRoute('admin'), 600);
      return () => clearTimeout(timer);
    }
  }, [adminSuccess, isAdmin, setRoute]);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminError('');
    const email = data.email.trim().toLowerCase() || 'admin@desarpro.com';
    const res = await adminLogin(email, adminPwd);
    if (res && res.ok) {
      setAdminSuccess(true);
    } else {
      setAdminError(res && res.error === 'server' ? t('common.serverError') : res?.error === 'forbidden' ? tp('portal.client.accessDenied') : t('login.form.passwordWrong'));
      setTimeout(() => setAdminError(''), 2500);
    }
  };

  const handleClientSubmit = async () => {
    setFormError('');
    setSubmitting(true);
    const email = data.email.trim().toLowerCase();
    if (!email || !data.password) {
      setFormError(t('login.form.emailPlaceholder'));
      setSubmitting(false);
      return;
    }
    if (mode === 'register') {
      if (data.password.length < 6) {
        setFormError(tp('portal.register.passwordMin'));
        setSubmitting(false);
        return;
      }
      if (data.password !== data.passwordConfirm) {
        setFormError(tp('portal.register.passwordMismatch'));
        setSubmitting(false);
        return;
      }
      const parts = (data.name || '').trim().split(/\s+/);
      const res = await registerAccount({
        email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        company: data.company,
        phone: data.phone,
      });
      if (res.ok && res.data?.pending) {
        setPendingMsg(res.data.message || tp('portal.auth.registerPending'));
        setMode('login');
      } else if (res.ok && res.data?.token) {
        writeToken(res.data.token);
        writeUser(res.data.user);
        setFormSuccess(true);
        setTimeout(() => setRoute('client'), 600);
      } else {
        setFormError(res.error === 'email_exists' ? tp('portal.auth.emailExists') : (res.error || t('common.serverError')));
      }
    } else {
      const res = await loginAccount(email, data.password);
      if (res.ok && res.data?.token) {
        writeToken(res.data.token);
        writeUser(res.data.user);
        if (isAdminUser(res.data.user)) {
          setRoute('admin');
        } else if (isClientUser(res.data.user)) {
          setRoute('client');
        } else {
          setFormError(tp('portal.client.accessDenied'));
        }
      } else {
        const errCode = res.data?.error || res.error;
        setFormError(errCode === 'pending' ? tp('portal.auth.pendingApproval') : errCode === 'rejected' ? tp('portal.auth.accountRejected') : errCode === 'suspended' ? tp('portal.auth.accountSuspended') : errCode === 'blocked' ? tp('portal.auth.accountBlocked') : t('login.form.passwordWrong'));
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="page" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <EarthGlobeScene/>

      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', alignItems: 'center' }} className="login-layout">
        {/* Left side — branding */}
        <div style={{ padding: 'clamp(40px, 8vw, 120px) clamp(20px, 5vw, 60px) clamp(20px, 4vw, 60px)' }} className="login-left">
          <Reveal>
            <a onClick={() => setRoute('home')} style={{ cursor: 'pointer', display: 'inline-block', marginBottom: 40 }}>
              <Logo size={44} animated/>
            </a>
          </Reveal>
          <Reveal delay={120}>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 20px', textShadow: '0 4px 24px rgba(0,0,0,0.6)' }}>
              <Editable id="login.title.pre" defaultValue="Bienvenido a tu"/> <br/>
              <span className="text-grad-blue"><Editable id="login.title.highlight" defaultValue="portal cliente"/></span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, maxWidth: 460, margin: 0, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
              <Editable id="login.subtitle" multiline defaultValue="Accede al estado de tus proyectos, tickets de soporte, facturación y reportes en tiempo real. Todo lo que necesitas para mantener tu operación bajo control."/>
            </p>
          </Reveal>

          <Reveal delay={360}>
            <div style={{ marginTop: 48, display: 'grid', gap: 18 }}>
              {[
                { icon: 'Activity', k: 'login.feature.1', t: 'Estado de proyectos en vivo' },
                { icon: 'Lock', k: 'login.feature.2', t: 'Soporte técnico 24/7' },
                { icon: 'BarChart', k: 'login.feature.3', t: 'Métricas y reportes ejecutivos' },
              ].map((b, i) => {
                const I = Icon[b.icon];
                return (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <span style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(34,211,238,0.18)', color: '#22D3EE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(34,211,238,0.35)' }}><I size={18}/></span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 500 }}>
                      <Editable id={b.k} defaultValue={b.t}/>
                    </span>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* Right — form */}
        <div style={{ padding: 'clamp(20px, 4vw, 60px)', display: 'flex', justifyContent: 'center' }} className="login-right">
          <Reveal delay={200}>
            <div className="glass-2" style={{ width: 'clamp(320px, 50vw, 420px)', maxWidth: '100%', borderRadius: 24, padding: 'clamp(20px, 4vw, 36px)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', background: 'rgba(10,12,20,0.78)', backdropFilter: 'blur(24px) saturate(140%)', border: '1px solid rgba(255,255,255,0.12)' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 12, marginBottom: 24 }}>
                {[['login', t('login.form.login')], ['register', t('login.form.register')], ['admin', t('login.form.admin')]].map(([id, label]) => (
                  <button key={id} onClick={() => { setMode(id); setAdminError(''); setAdminSuccess(false); }} style={{
                    flex: 1, padding: '10px 6px', borderRadius: 8,
                    background: mode === id ? (id === 'admin' ? 'linear-gradient(135deg, #F59E0B, #F97316)' : 'linear-gradient(135deg, #3B82F6, #06B6D4)') : 'transparent',
                    color: mode === id ? '#fff' : 'rgba(255,255,255,0.6)',
                    fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', transition: 'all 200ms', minHeight: 40,
                  }}>{label}</button>
                ))}
              </div>

              {mode === 'admin' ? (
                <>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon.Shield size={22} stroke="#F59E0B"/> {t('login.form.adminTitle')}
                  </h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 24px' }}>
                    {t('login.form.adminDescription')}
                  </p>

                  {adminSuccess ? (
                    <div style={{ padding: 20, borderRadius: 12, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)', color: '#86efac', textAlign: 'center' }}>
                      <Icon.Check size={32} stroke="#86efac" sw={2.5}/>
                      <div style={{ marginTop: 10, fontWeight: 600 }}>{t('login.form.sessionStarted')}</div>
                      <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{t('common.loading')}</div>
                    </div>
                  ) : (
                    <div onKeyDown={(e) => { if (e.key === 'Enter') handleAdminSubmit(e); }} style={{ display: 'grid', gap: 14 }}>
                      <FormField label={t('login.form.email')}>
                        <input
                          type="email"
                          value={data.email}
                          onChange={e => setData(d => ({ ...d, email: e.target.value }))}
                          placeholder={t('login.form.emailPlaceholder')}
                          className="input"
                          style={{ minHeight: 44 }}
                        />
                      </FormField>
                      <FormField label={t('login.form.adminPassword')}>
                        <input
                          type="password"
                          value={adminPwd}
                          onChange={e => setAdminPwd(e.target.value)}
                          placeholder="••••••••••••"
                          className="input"
                          style={{ minHeight: 44 }}
                          autoFocus
                        />
                      </FormField>

                      {adminError && (
                        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Icon.X size={14}/> {adminError}
                        </div>
                      )}

                      <button type="button" onClick={handleAdminSubmit} className="btn btn-primary" style={{ marginTop: 6, padding: '14px 20px', justifyContent: 'center', background: 'linear-gradient(135deg, #F59E0B, #F97316)', minHeight: 48 }}>
                        {t('login.form.enterPanel')} <Icon.ArrowRight size={14}/>
                      </button>

                      <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '8px 0 0', lineHeight: 1.55 }}>
                        {t('login.form.adminOnly')}
                      </p>
                    </div>
                  )}
                </>
              ) : mode === 'forgot' ? (
                <>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{tp('portal.auth.forgotTitle')}</h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 24px' }}>{tp('portal.auth.forgotDesc')}</p>
                  <div style={{ display: 'grid', gap: 14 }}>
                    <FormField label={t('login.form.email')}>
                      <input type="email" value={data.email} onChange={e => setData(d => ({ ...d, email: e.target.value }))} className="input" style={{ minHeight: 44 }}/>
                    </FormField>
                    {formError && <div style={{ padding: 10, borderRadius: 10, background: 'rgba(239,68,68,0.12)', color: '#fca5a5', fontSize: 13 }}>{formError}</div>}
                    {formSuccess && <div style={{ padding: 10, borderRadius: 10, background: 'rgba(34,197,94,0.12)', color: '#86efac', fontSize: 13 }}>{tp('portal.auth.forgotSent')}</div>}
                    <button type="button" className="btn btn-primary" disabled={submitting} style={{ minHeight: 48 }} onClick={async () => {
                      setSubmitting(true); setFormError(''); setFormSuccess(false);
                      const res = await requestPasswordReset(data.email.trim().toLowerCase());
                      setSubmitting(false);
                      if (res.ok) setFormSuccess(true);
                      else setFormError(res.error || t('common.serverError'));
                    }}>{tp('portal.auth.forgotSubmit')}</button>
                    <button type="button" className="btn btn-ghost" onClick={() => { setMode('login'); setFormError(''); setFormSuccess(false); }}>{tp('portal.auth.backLogin')}</button>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
                    {mode === 'login' ? t('login.greeting') : t('login.register')}
                  </h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 24px' }}>
                    {mode === 'login' ? t('login.loginSubtitle') : t('login.registerSubtitle')}
                  </p>
                  {pendingMsg && mode === 'login' && (
                    <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#FBBF24', fontSize: 13, marginBottom: 14 }}>
                      {pendingMsg}
                    </div>
                  )}

                  <div style={{ display: 'grid', gap: 14 }}>
                    {mode === 'register' && (
                      <>
                        <FormField label={t('login.form.name')}>
                          <input type="text" value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} placeholder={t('login.form.namePlaceholder')} className="input" style={{ minHeight: 44 }}/>
                        </FormField>
                        <FormField label={tp('portal.register.company')}>
                          <input type="text" value={data.company} onChange={e => setData(d => ({ ...d, company: e.target.value }))} className="input" style={{ minHeight: 44 }}/>
                        </FormField>
                        <FormField label={tp('portal.register.phone')}>
                          <input type="tel" value={data.phone} onChange={e => setData(d => ({ ...d, phone: e.target.value }))} className="input" style={{ minHeight: 44 }}/>
                        </FormField>
                      </>
                    )}
                    <FormField label={t('login.form.email')}>
                      <input type="email" value={data.email} onChange={e => setData(d => ({ ...d, email: e.target.value }))} placeholder={t('login.form.emailPlaceholder')} className="input" style={{ minHeight: 44 }}/>
                    </FormField>
                    <FormField label={t('login.form.password')}>
                      <input type="password" value={data.password} onChange={e => setData(d => ({ ...d, password: e.target.value }))} placeholder="••••••••" className="input" style={{ minHeight: 44 }}/>
                    </FormField>
                    {mode === 'register' && (
                      <FormField label={tp('portal.register.confirmPassword')}>
                        <input type="password" value={data.passwordConfirm} onChange={e => setData(d => ({ ...d, passwordConfirm: e.target.value }))} placeholder="••••••••" className="input" style={{ minHeight: 44 }}/>
                      </FormField>
                    )}

                    {formError && (
                      <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon.X size={14}/> {formError}
                      </div>
                    )}

                    {formSuccess && (
                      <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)', color: '#86efac', fontSize: 13 }}>
                        {t('login.form.sessionStarted')}
                      </div>
                    )}

                    {mode === 'login' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', fontSize: 13, cursor: 'pointer', minHeight: 40 }}>
                          <input type="checkbox" checked={data.remember} onChange={e => setData(d => ({ ...d, remember: e.target.checked }))} style={{ accentColor: '#22D3EE', width: 18, height: 18 }}/>
                          {t('login.form.remember')}
                        </label>
                        <button type="button" onClick={() => { setMode('forgot'); setFormError(''); setFormSuccess(false); }} style={{ background: 'none', border: 'none', color: '#22D3EE', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: 0 }}>{t('login.form.forgotPassword')}</button>
                      </div>
                    )}

                    <button type="button" onClick={handleClientSubmit} disabled={submitting} className="btn btn-primary" style={{ marginTop: 6, padding: '14px 20px', justifyContent: 'center', minHeight: 48 }}>
                      {submitting ? t('common.loading') : (mode === 'login' ? t('login.form.loginBtn') : t('login.form.registerBtn'))} <Icon.ArrowRight size={14}/>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
                      <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }}/>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('login.form.orContinueWith')}</span>
                      <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }}/>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <button type="button" className="btn btn-ghost on-dark-bg" style={{ padding: '12px', justifyContent: 'center', fontSize: 13, minHeight: 44 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#fff" d="M12 11v3h5c-.2 1.4-1.5 4-5 4-3 0-5.5-2.5-5.5-5.5S9 7 12 7c1.7 0 2.8.7 3.5 1.3l2.4-2.3C16.5 4.7 14.5 4 12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8c4.6 0 7.7-3.2 7.7-7.8 0-.5 0-1-.1-1.2H12z"/></svg>
                        Google
                      </button>
                      <button type="button" className="btn btn-ghost on-dark-bg" style={{ padding: '12px', justifyContent: 'center', fontSize: 13, minHeight: 44 }}>
                        <Icon.Github size={16}/> GitHub
                      </button>
                    </div>

                    <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '8px 0 0', lineHeight: 1.55 }}>
                      {t('login.form.continueAgree')} <a href="#" style={{ color: '#22D3EE' }}>{t('footer.legal.terms')}</a> y <a href="#" style={{ color: '#22D3EE' }}>{t('footer.legal.privacy')}</a>.
                    </p>
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .login-layout { grid-template-columns: 1fr !important; }
          .login-left { padding: 120px 24px 20px !important; text-align: center; }
          .login-right { padding: 20px 24px 60px !important; }
        }
      `}</style>
    </div>
  );
}

export default Login;
export { Login, FormField };
