import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

// const locales: Record<string, Locale> = {
//   en: enUS,
//   ne: ne
// };

@Pipe({
  name: 'prettyDate'
})
export class PrettyDatePipe implements PipeTransform {
  // transform(value: string): string {
  //   const date = parseISO(value);
  //   return formatDistanceToNowStrict(date, { addSuffix: true });
  // }

  // localeId = inject(LOCALE_ID);

  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = typeof value === 'string' ? parseISO(value) : value;

    return formatDistanceToNowStrict(date, {
      addSuffix: true,
      // locale: locales[this.localeId]
    });
  }
}

// date-fns does not include nepali language support
