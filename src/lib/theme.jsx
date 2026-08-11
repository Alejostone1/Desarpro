// Theme system — dark/light with localStorage persistence.
// Sets data-theme on documentElement, exposes useTheme() and ThemeToggle component.

const ThemeContext = React.createContext({ theme: 'dark', toggle: () => {}, setTheme: () => {} });

function ThemeProvider({ children }) {
  const [theme, setThemeState] = React.useState(() => {
    try {
      const saved = localStorage.getItem('desarpro:theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return 'dark';
  });

  const setTheme = React.useCallback((t) => {
    setThemeState(t);
    try { localStorage.setItem('desarpro:theme', t); } catch (e) {}
  }, []);

  const toggle = React.useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('desarpro:theme', next); } catch (e) {}
      return next;
    });
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return React.createElement(ThemeContext.Provider, { value: { theme, toggle, setTheme } }, children);
}

function useTheme() {
  return React.useContext(ThemeContext);
}

function ThemeToggle({ size = 38, style = {} }) {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? t('common.themeToLight') : t('common.themeToDark')}
      title={isDark ? t('common.themeToLight') : t('common.themeToDark')}
      style={{
        width: size, height: size,
        background: 'var(--glass-bg-2)',
        border: '1px solid var(--glass-border-2)',
        color: 'var(--text-0)',
        borderRadius: 999,
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(12px)',
        transition: 'all 240ms var(--ease-out)',
        position: 'relative', overflow: 'hidden',
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = 'var(--glass-bg-3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'var(--glass-bg-2)'; }}
    >
      {/* Sun/Moon morph */}
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" style={{ transition: 'transform 400ms var(--ease-spring)' }}>
        {isDark ? (
          // Moon (currently dark — clicking goes to light)
          <g style={{ animation: 'theme-fade-in 320ms ease' }}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        ) : (
          // Sun
          <g style={{ animation: 'theme-fade-in 320ms ease' }}>
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/>
            <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="4"/>
              <line x1="12" y1="20" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="4" y2="12"/>
              <line x1="20" y1="12" x2="22" y2="12"/>
              <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/>
              <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>
              <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/>
              <line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/>
            </g>
          </g>
        )}
      </svg>
      <style>{`@keyframes theme-fade-in { from { opacity: 0; transform: rotate(-90deg) scale(0.6); } to { opacity: 1; transform: rotate(0) scale(1); } }`}</style>
    </button>
  );
}

window.ThemeProvider = ThemeProvider;
window.useTheme = useTheme;
window.ThemeToggle = ThemeToggle;
