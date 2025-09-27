'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, Dictionary, getDictionary } from '@/i18n/dictionaries';

interface LanguageContextType {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id');
  const [dictionary, setDictionary] = useState<Dictionary>(getDictionary('id'));

  useEffect(() => {
    // Load saved language from localStorage
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('gemitra-locale') as Locale;
      if (savedLocale && (savedLocale === 'id' || savedLocale === 'en')) {
        setLocaleState(savedLocale);
        setDictionary(getDictionary(savedLocale));
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setDictionary(getDictionary(newLocale));
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemitra-locale', newLocale);
      // Update document language attribute
      document.documentElement.lang = newLocale;
    }
  };

  return (
    <LanguageContext.Provider value={{ locale, dictionary, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Fallback untuk development atau jika context tidak tersedia
    if (process.env.NODE_ENV === 'development') {
      console.warn('useLanguage must be used within a LanguageProvider. Using fallback dictionary.');
      return {
        locale: 'id' as Locale,
        dictionary: getDictionary('id'),
        setLocale: () => {}
      };
    }
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
