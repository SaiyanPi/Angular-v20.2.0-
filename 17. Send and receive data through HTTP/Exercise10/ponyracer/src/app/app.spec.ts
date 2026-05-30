import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Mocked } from 'vitest';
import { page } from 'vitest/browser';
import { App } from './app';
import { RaceModel } from './models/race-model';
import { RaceService } from './services/race-service';

class AppTester {
  readonly fixture = TestBed.createComponent(App);
  readonly title = page.getByRole('heading', { level: 1 });
  readonly menu = page.getByCss('pr-menu');
  readonly races = page.getByCss('pr-races');
}

describe('App', () => {
  let raceService: Pick<Mocked<RaceService>, 'list'>;

  beforeEach(() => {
    raceService = { list: vi.fn().mockName('RaceService.list') };
    TestBed.configureTestingModule({
      providers: [{ provide: RaceService, useValue: raceService }]
    });
    raceService.list!.mockReturnValue(
      of([
        { id: 1, name: 'Tokyo', startInstant: '2024-02-18T08:03:00Z' },
        { id: 2, name: 'Paris', startInstant: '2024-02-18T08:04:00Z' }
      ] as Array<RaceModel>)
    );
  });

  it('should have a title', async () => {
    const tester = new AppTester();

    await expect.element(tester.title).toHaveTextContent('Ponyracer');
  });

  it('should display the menu component', async () => {
    const tester = new AppTester();

    await expect.element(tester.menu).toBeVisible();
  });

  it('should display the races component', async () => {
    const tester = new AppTester();

    await expect.element(tester.races).toBeVisible();
  });
});
