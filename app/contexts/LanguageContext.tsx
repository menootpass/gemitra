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
    const savedLocale = localStorage.getItem('gemitra-locale') as Locale;
    if (savedLocale && (savedLocale === 'id' || savedLocale === 'en')) {
      setLocaleState(savedLocale);
      setDictionary(getDictionary(savedLocale));
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setDictionary(getDictionary(newLocale));
    localStorage.setItem('gemitra-locale', newLocale);
    
    // Update document language attribute
    document.documentElement.lang = newLocale;
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
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
