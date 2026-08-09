// i18n system — context and hook for language management
// Manages language state, localStorage persistence, translations

const I18nContext = React.createContext();

function I18nProvider({ children }) {
  const [language, setLanguageState] = React.useState(() => {
    // Try to load from localStorage
    try {
      return localStorage.getItem('desarpro:language') || 'es';
    } catch (e) {
      return 'es';
    }
  });

  const setLanguage = React.useCallback((lang) => {
    if (!__i18nTranslations[lang]) {
      console.warn(`Language "${lang}" not found, falling back to es`);
      return;
    }
    setLanguageState(lang);
    try {
      localStorage.setItem('desarpro:language', lang);
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
  }, []);

  const t = React.useCallback((key) => {
    const keys = key.split('.');
    let value = __i18nTranslations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Spanish if key not found
        let fallback = __i18nTranslations.es;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key;
          }
        }
        return fallback;
      }
    }

    return typeof value === 'string' ? value : key;
  }, [language]);

  const value = React.useMemo(() => ({
    language,
    setLanguage,
    t,
    availableLanguages: ['es', 'en', 'pt', 'fr', 'de'],
  }), [language, setLanguage, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

function useTranslations() {
  const { t } = useI18n();
  return t;
}

window.I18nProvider = I18nProvider;
window.useI18n = useI18n;
window.useTranslations = useTranslations;
