/**
 * Localization runtime.
 *
 * Backwards compatible with the original API (`language`, `setLanguage`, `t`)
 * and additive: `t` now supports `{placeholder}` interpolation, and
 * currency / date / number formatting is locale-aware so screens stop
 * hand-concatenating `'₹' + value`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { en } from '../translations/en';
import { gu } from '../translations/gu';

export type Language = 'en' | 'gu';

/** Selectable languages, in display order. */
export const LOCALES: { code: Language; labelKey: string }[] = [
  { code: 'en', labelKey: 'language.english' },
  { code: 'gu', labelKey: 'language.gujarati' },
];

const LANGUAGE_STORAGE_KEY = '@vegbites/language';

type Vars = Record<string, string | number>;

const catalogues: Record<Language, Record<string, unknown>> = { en, gu };

/** Deep-reads a dot path such as `home.greeting` from a catalogue. */
function readPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object' && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match,
  );
}

/** Maps a device language tag (e.g. "gu-IN") onto a supported language. */
export function resolveLanguage(tag: string | null | undefined): Language {
  return tag && tag.toLowerCase().startsWith('gu') ? 'gu' : 'en';
}

export function formatCurrency(amount: number, language: Language = 'en'): string {
  const value = Math.round(Number.isFinite(amount) ? amount : 0);
  return `₹${value.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-IN')}`;
}

export function formatNumber(value: number, language: Language = 'en'): string {
  if (value >= 1000) {
    const thousands = value / 1000;
    const text = thousands >= 10 ? String(Math.round(thousands)) : thousands.toFixed(1).replace(/\.0$/, '');
    return `${text}k`;
  }
  return value.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-IN');
}

export function formatDateValue(input: string | number | Date, language: Language = 'en'): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return date.toLocaleDateString(language === 'gu' ? 'gu-IN' : 'en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return date.toDateString();
  }
}

export function formatTimeValue(input: string | number | Date, language: Language = 'en'): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return date.toLocaleTimeString(language === 'gu' ? 'gu-IN' : 'en-IN', {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return date.toTimeString().slice(0, 5);
  }
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Translate a dot-path key, optionally interpolating `{vars}`. */
  t: (key: string, vars?: Vars) => string;
  /** `₹1,240` */
  currency: (amount: number) => string;
  /** `12.4k` */
  count: (value: number) => string;
  /** `Mon, 13 Oct` */
  date: (input: string | number | Date) => string;
  /** `6:45 pm` */
  time: (input: string | number | Date) => string;
  isGujarati: boolean;
  /** True once the persisted language has been restored. */
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: () => '',
  currency: (amount) => formatCurrency(amount, 'en'),
  count: (value) => formatNumber(value, 'en'),
  date: (input) => formatDateValue(input, 'en'),
  time: (input) => formatTimeValue(input, 'en'),
  isGujarati: false,
  ready: false,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'en' || saved === 'gu') setLanguageState(saved);
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const t = useCallback(
    (keyPath: string, vars?: Vars): string => {
      const direct = readPath(catalogues[language], keyPath);
      if (typeof direct === 'string') return interpolate(direct, vars);
      // Fall back to English, then to the key itself so a miss is visible in QA
      // instead of rendering an empty string.
      const fallback = readPath(catalogues.en, keyPath);
      return typeof fallback === 'string' ? interpolate(fallback, vars) : keyPath;
    },
    [language],
  );

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      t,
      currency: (amount: number) => formatCurrency(amount, language),
      count: (value: number) => formatNumber(value, language),
      date: (input) => formatDateValue(input, language),
      time: (input) => formatTimeValue(input, language),
      isGujarati: language === 'gu',
      ready,
    }),
    [language, setLanguage, t, ready],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);

/** Alias for screens that only need the translate function. */
export const useT = () => useContext(LanguageContext).t;
