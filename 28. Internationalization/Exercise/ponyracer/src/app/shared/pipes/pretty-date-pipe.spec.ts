import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { PrettyDatePipe } from './pretty-date-pipe';

describe('PrettyDatePipe', () => {
  it('should transform the input', () => {
    // given a pipe
    const pipe = new PrettyDatePipe();

    // when transforming the date
    const date = '2020-02-18T08:02:00Z';
    const transformed = pipe.transform(date);

    // then we should have a formatted string
    expect(
      transformed,
      'The pipe should transform the date into a human string, using the `formatDistanceToNowStrict` function of date-fns'
    ).toContain(formatDistanceToNowStrict(parseISO(date), { addSuffix: true }));
  });
});


// given that the nepali language was supported by date-fns
// describe('FromNowPipe', () => {
//   it('should transform the input in English', () => {
//     TestBed.configureTestingModule({
//       providers: [provideI18nTesting('en')]
//     });

//     // given a pipe
//     const pipe = TestBed.runInInjectionContext(() => new FromNowPipe());

//     // when transforming the date
//     const date = '2020-02-18T08:02:00Z';
//     const transformed = pipe.transform(date);

//     // then we should have a formatted string
//     expect(
//       transformed,
//       'The pipe should transform the date into a human string, using the `formatDistanceToNowStrict` function of date-fns'
//     ).toContain(formatDistanceToNowStrict(parseISO(date), { addSuffix: true, locale: enUS }));
//   });

//   it('should transform the input in French', () => {
//     TestBed.configureTestingModule({
//       providers: [provideI18nTesting('ne')]
//     });

//     // given a pipe
//     TestBed.configureTestingModule({});
//     const pipe = TestBed.runInInjectionContext(() => new FromNowPipe());

//     // when transforming the date
//     const date = '2020-02-18T08:02:00Z';
//     const transformed = pipe.transform(date);

//     // then we should have a formatted string
//     expect(
//       transformed,
//       'The pipe should transform the date into a human string, using the `formatDistanceToNowStrict` function of date-fns'
//     ).toContain(formatDistanceToNowStrict(parseISO(date), { addSuffix: true, locale: ne }));
//   });
// });
