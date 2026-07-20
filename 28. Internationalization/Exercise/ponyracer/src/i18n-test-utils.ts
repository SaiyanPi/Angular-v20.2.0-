import { importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideTranslocoMissingHandler, TranslocoMissingHandler, TranslocoTestingModule } from '@jsverse/transloco';
import { vi } from 'vitest';
import { I18nService } from './app/services/i18n-service';
import en from './app/i18n/en.json';
import ne from './app/i18n/ne.json';
// The app config import is to make sure that the locale data are imported correctly
import './app/app.config';


class ThrowingMissingHandler implements TranslocoMissingHandler {
  handle(key: string): never {
    throw new Error(`missing translation for key: ${key}`);
  }
}

export function provideI18nTesting(lang: 'en' | 'ne' = 'en') {
  return [
    importProvidersFrom(
      TranslocoTestingModule.forRoot({
        langs: { en, ne },
        translocoConfig: {
          availableLangs: ['en', 'ne'],
          defaultLang: lang
        },
        preloadLangs: true
      })
    ),
    provideTranslocoMissingHandler(ThrowingMissingHandler),
    { provide: LOCALE_ID, useValue: lang },
    {
      provide: I18nService,
      useValue: {
        changeLanguage: vi.fn().mockName('I18nService.changeLanguage'),
        availableLangs: ['en', 'ne'],
        lang
      }
    }
  ];
}
