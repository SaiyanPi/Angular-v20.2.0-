import { TestBed } from '@angular/core/testing';
import { Chart } from 'chart.js';
import { delay, of } from 'rxjs';
import { Mocked } from 'vitest';
import { page } from 'vitest/browser';
import { UserService } from '../services/user-service';
import { ScoreHistory } from './score-history';
import { ScoreHistoryModel } from '../models/score-history-model';

class ScoreHistoryTester {
  readonly title = page.getByRole('heading', { level: 1 });
  readonly canvas = page.getByCss('canvas');

  constructor() {
    TestBed.createComponent(ScoreHistory);
  }
}

describe('ScoreHistory', () => {
  const userService: Pick<Mocked<UserService>, 'getScoreHistory'> = {
    getScoreHistory: vi.fn().mockName('UserService.getScoreHistory')
  };

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: UserService, useValue: userService }]
    })
  );

  it('should display a chart', async () => {
    const history = [
      { instant: '2017-08-03T10:40:00Z', money: 10000 },
      { instant: '2017-08-04T09:15:00Z', money: 9800 }
    ] as Array<ScoreHistoryModel>;
    userService.getScoreHistory.mockReturnValue(of(history).pipe(delay(5)));
    const tester = new ScoreHistoryTester();

    await expect.element(tester.title).toHaveTextContent('Score history');
    await expect.element(tester.canvas).toBeVisible();

    const canvasElement = tester.canvas.element() as HTMLCanvasElement;

    await expect.poll(() => Chart.getChart(canvasElement)).toBeDefined();
    expect(userService.getScoreHistory).toHaveBeenCalledWith();

    const chart = Chart.getChart(canvasElement)!;

    expect(chart.config.data.labels, 'The chart labels should be the instants').toStrictEqual(history.map(event => event.instant));
    expect(chart.config.data.datasets[0].data, 'The chart dataset should be the money').toStrictEqual(history.map(event => event.money));
  });
});
