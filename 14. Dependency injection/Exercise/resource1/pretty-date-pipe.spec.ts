// import { PrettyDatePipe } from './pretty-date-pipe';

// describe('PrettyDatePipe', () => {
//   it('create an instance', () => {
//     const pipe = new PrettyDatePipe();
//     expect(pipe).toBeTruthy();
//   });
// });

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
