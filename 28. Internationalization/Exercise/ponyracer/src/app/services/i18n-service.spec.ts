import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { I18nService, WINDOW } from './i18n-service';
import en from '../i18n/en.json';
import ne from '../i18n/ne.json';

describe('I18nService', () => {
  let translocoService: TranslocoService;
  let mockWindow: Window;

  beforeEach(() => {
    mockWindow = {
      location: { reload: vi.fn().mockName('reload') },
      document: { documentElement: { lang: '' } }
    } as unknown as Window;
    TestBed.configureTestingModule({
      providers: [
        importProvidersFrom(
          TranslocoTestingModule.forRoot({
            langs: { en, ne },
            translocoConfig: {
              availableLangs: ['en', 'ne'],
              defaultLang: 'en'
            },
            preloadLangs: true
          })
        ),
        { provide: WINDOW, useValue: mockWindow }
      ]
    });
    translocoService = TestBed.inject(TranslocoService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });

  it('should get the active language when created', () => {
    const getActiveLangSpy = vi.spyOn(translocoService, 'getActiveLang');
    getActiveLangSpy.mockReturnValue('ne');
    const service = TestBed.inject(I18nService);

    expect(service.lang).toBe('ne');
    expect(getActiveLangSpy).toHaveBeenCalledWith();
  });

  it('should change the language and reload the page', () => {
    vi.spyOn(translocoService, 'getActiveLang').mockReturnValue('en');
    const setActiveLangSpy = vi.spyOn(translocoService, 'setActiveLang');
    const service = TestBed.inject(I18nService);
    service.changeLanguage('ne');

    expect(setActiveLangSpy).toHaveBeenCalledWith('ne');
    expect(mockWindow.location.reload).toHaveBeenCalledWith();
  });

  it('should ignore the current language', () => {
    const setActiveLangSpy = vi.spyOn(translocoService, 'setActiveLang');
    const service = TestBed.inject(I18nService);
    service.changeLanguage('en');

    expect(setActiveLangSpy).not.toHaveBeenCalled();
    expect(mockWindow.location.reload).not.toHaveBeenCalled();
  });
});
