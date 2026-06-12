import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { translations } from '@/lib/data';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en; // Legacy object
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();

  const language = (i18n.language || 'vi') as Language;

  const setLanguage = useCallback((lang: Language) => {
    i18n.changeLanguage(lang);
    try { localStorage.setItem('dta_language', lang); } catch { /* ignore */ }
  }, [i18n]);

  // Fallback object for components not yet rewritten
  const t = translations[language] || translations.vi;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
