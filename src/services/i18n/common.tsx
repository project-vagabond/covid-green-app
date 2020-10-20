import en from 'assets/lang/en.json';
import zh from 'assets/lang/zh.json';
import ru from 'assets/lang/ru.json';
import ht from 'assets/lang/ht.json';
import bn from 'assets/lang/bn.json';
import ko from 'assets/lang/ko.json';
import es from 'assets/lang/es.json';
import ar from 'assets/lang/ar.json';
import ur from 'assets/lang/ur.json';
import yi from 'assets/lang/yi.json';
import {TOptionsBase} from 'i18next';

export const fallback = 'en';
export const defaultNamespace = 'common';
export const namespaces = ['common'];

const leftToRightMarker = '';

export const supportedLocales = {
  ar: {
    name: `${leftToRightMarker}العربية (Arabic)`,
    ...ar
  },
  bn: {
    name: 'বাংলা (Bengali)',
    ...bn
  },
  zh: {
    name: '中文 (Chinese)',
    ...zh
  },
  en: {
    name: 'English',
    ...en
  },
  ht: {
    name: 'Kreyòl ayisyen (Haitian Creole)',
    ...ht
  },
  ko: {
    name: '한국어 (Korean)',
    ...ko
  },
  ru: {
    name: 'русский (Russian)',
    ...ru
  },
  es: {
    name: 'Español (Spanish)',
    ...es
  },
  ur: {
    name: `${leftToRightMarker}اردو (Urdu)`,
    ...ur
  },
  yi: {
    name: `${leftToRightMarker}אידיש (Yiddish)`,
    ...yi
  }
};

// i18next is missing pluralisation rules for these and incorrectly treats all counts as singular
const langsMissingPluralRules = ['yi', 'ht'];

export const pluralize = (count: number, langCode: string): TOptionsBase => {
  const options = {count} as TOptionsBase;
  if (langsMissingPluralRules.includes(langCode) && count !== 1) {
    options.context = 'plural';
  }
  return options;
};
