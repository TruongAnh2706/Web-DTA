import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { translations, Language } from '@/lib/data';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Đọc ngôn ngữ đã lưu từ localStorage, mặc định là 'vi' (Tiếng Việt)
const getInitialLanguage = (): Language => {
  try {
    const saved = localStorage.getItem('dta_language');
    if (saved === 'en' || saved === 'vi') return saved;
  } catch { /* ignore */ }
  return 'vi';
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem('dta_language', lang); } catch { /* ignore */ }
  }, []);

  const t = translations[language];

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
