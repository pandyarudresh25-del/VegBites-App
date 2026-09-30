import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { en } from '../translations/en';
import { gu } from '../translations/gu';

type Language = 'en' | 'gu';
const LANGUAGE_STORAGE_KEY = '@vegbites/language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: () => '',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  const translations = {
    en,
    gu,
  };

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((savedLanguage) => {
        if (savedLanguage === 'en' || savedLanguage === 'gu') {
          setLanguageState(savedLanguage);
        }
      })
      .catch(() => undefined);
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage).catch(() => undefined);
  }, []);

  const t = useCallback((keyPath: string): string => {
    const keys = keyPath.split('.');
    let result: any = translations[language];
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        // Fallback to english if not found
        let fallback: any = translations.en;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            return keyPath; // Return the key path if no translation is found at all
          }
        }
        return typeof fallback === 'string' ? fallback : keyPath;
      }
    }
    
    return typeof result === 'string' ? result : keyPath;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
