import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

@Pipe({
  name: 'prettyDate'
})
export class PrettyDatePipe implements PipeTransform {
  // transform(value: string, ..._args: Array<unknown>): string {
  //   const date = parseISO(value);
  //   return formatDistanceToNowStrict(date, { addSuffix: true });
  // }

  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = typeof value === 'string' ? parseISO(value) : value;

    return formatDistanceToNowStrict(date, {
      addSuffix: true
    });
  }
}
