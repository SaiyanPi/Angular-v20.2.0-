import { inject, InjectionToken, Service } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export const AVAILABLE_LANGS: ReadonlyArray<string> = ['en', 'ne'];
export const WINDOW = new InjectionToken<Window>('Window', {
  factory: () => window
});

@Service()
export class I18nService {
  private readonly translocoService = inject(TranslocoService);
  private readonly window = inject(WINDOW);

  readonly availableLangs = AVAILABLE_LANGS;
  readonly lang = this.translocoService.getActiveLang();

  constructor() {
    this.window.document.documentElement.lang = this.lang;
  }

  changeLanguage(lang: string) {
    if (lang === this.lang) {
      return;
    }
    this.translocoService.setActiveLang(lang);
    this.window.location.reload();
  }
}
