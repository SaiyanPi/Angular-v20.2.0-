import '@angular/common/locales/global/fr';
import { ApplicationConfig, inject, isDevMode, LOCALE_ID, provideBrowserGlobalErrorListeners, Service } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './jwt-interceptor';
import { provideTransloco, Translation, TranslocoLoader, TranslocoService } from '@jsverse/transloco';
import { AVAILABLE_LANGS } from './services/i18n-service';
import { provideTranslocoPersistLang } from '@jsverse/transloco-persist-lang';

@Service()
export class TranslocoModuleLoader implements TranslocoLoader {
  getTranslation(lang: string): Promise<Translation> {
    return import(`./i18n/${lang}.json`).then((m: { default: Translation }) => m.default);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideSignalFormsConfig({
      classes: {
        'is-invalid': field => field.state().invalid() && field.state().touched()
      }
    }),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideTransloco({
      config: {
        availableLangs: [...AVAILABLE_LANGS],
        defaultLang: 'en',
        prodMode: !isDevMode()
      },
      loader: TranslocoModuleLoader
    }),
    provideTranslocoPersistLang({
      getLangFn: ({ cachedLang, browserLang, defaultLang }) => {
        const lang = cachedLang ?? browserLang ?? defaultLang;
        return AVAILABLE_LANGS.includes(lang) ? lang : defaultLang;
      },
      storage: {
        useValue: localStorage
      }
    }),
    {
      provide: LOCALE_ID,
      useFactory: () => inject(TranslocoService).getActiveLang()
    }
  ]
};
