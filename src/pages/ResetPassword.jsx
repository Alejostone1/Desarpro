import React from 'react';
import { useI18n } from '../i18n/index.jsx';
import { validateResetToken, resetPassword } from '../lib/portalData.jsx';
import Icon from '../lib/icons.jsx';
import Logo from '../components/Logo.jsx';

function ResetPassword({ setRoute }) {
  const { t } = useI18n();
  const [token] = React.useState(() => {
    const hash = window.location.hash || '';
    const q = hash.includes('?') ? hash.split('?')[1] : '';
    return new URLSearchParams(q).get('token') || '';
  });
  const [valid, setValid] = React.useState(null);
  const [pwd, setPwd] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [err, setErr] = React.useState('');
  const [done, setDone] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!token) { setValid(false); return; }
    validateResetToken(token).then(setValid);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (pwd.length < 6) { setErr(t('portal.register.passwordMin')); return; }
    if (pwd !== confirm) { setErr(t('portal.register.passwordMismatch')); return; }
    setLoading(true);
    const res = await resetPassword(token, pwd, confirm);
    setLoading(false);
    if (res.ok) setDone(true);
    else setErr(res.error || t('common.serverError'));
  };

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-0)' }}>
      <div className="glass-2" style={{ width: 'min(420px, 100%)', padding: 32, borderRadius: 20 }}>
        <a onClick={() => setRoute('login')} style={{ cursor: 'pointer', display: 'inline-block', marginBottom: 20 }}>
          <Logo size={36} withWordmark/>
        </a>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>{t('portal.auth.resetTitle')}</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 24 }}>{t('portal.auth.resetDesc')}</p>

        {valid === null ? (
          <p style={{ color: 'var(--text-3)' }}>{t('common.loading')}</p>
        ) : !valid ? (
          <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: '#fca5a5', fontSize: 14 }}>
            {t('portal.auth.tokenInvalid')}
            <button type="button" className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => setRoute('login')}>{t('portal.auth.backLogin')}</button>
          </div>
        ) : done ? (
          <div style={{ padding: 16, borderRadius: 12, background: 'rgba(34,197,94,0.1)', color: '#86efac', fontSize: 14, textAlign: 'center' }}>
            <Icon.Check size={28}/>
            <p style={{ marginTop: 10 }}>{t('portal.auth.resetSuccess')}</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setRoute('login')}>{t('portal.auth.backLogin')}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            <input type="password" className="input" placeholder={t('portal.admin.users.password')} value={pwd} onChange={(e) => setPwd(e.target.value)} style={{ minHeight: 44 }}/>
            <input type="password" className="input" placeholder={t('portal.register.confirmPassword')} value={confirm} onChange={(e) => setConfirm(e.target.value)} style={{ minHeight: 44 }}/>
            {err && <p style={{ color: '#fca5a5', fontSize: 13 }}>{err}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minHeight: 44 }}>{t('portal.auth.resetSubmit')}</button>
          </form>
        )}
      </div>
    </div>
  );
}

export { ResetPassword };
