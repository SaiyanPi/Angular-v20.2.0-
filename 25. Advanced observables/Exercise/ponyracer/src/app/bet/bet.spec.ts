import { rxResource } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { delay, NEVER, of, throwError } from 'rxjs';
import { Mocked } from 'vitest';
import { page } from 'vitest/browser';
import { RaceModel } from '../models/race-model';
import { RaceService } from '../services/race-service';
import { Bet } from './bet';

function mockRaceResource(...values: Array<RaceModel>) {
  let index = 0;
  return (_raceId: () => number) => rxResource({ stream: () => of(values[Math.min(index++, values.length - 1)]).pipe(delay(5)) });
}

function mockRaceResourceError() {
  return (_raceId: () => number) => rxResource({ stream: () => throwError(() => new Error('Oops')) });
}

function mockRaceResourceLoading() {
  return (_raceId: () => number) => rxResource({ stream: () => NEVER });
}

class BetTester {
  constructor(readonly harness: RouterTestingHarness) {}

  readonly title = page.getByRole('heading', { level: 1 });
  readonly startInstant = page.getByRole('paragraph').nth(0);
  readonly loading = page.getByRole('status');
  readonly alert = page.getByRole('alert');
  readonly alertCloseButton = this.alert.getByRole('button', { name: 'Close' });
  readonly ponies = page.getByCss('pr-pony');
  readonly gentlePieFigure = this.ponies.nth(0).getByRole('figure');
  readonly selectedPonyWrappers = page.getByCss('.selected:has(pr-pony)');
}

describe('Bet', () => {
  let raceService: Pick<Mocked<RaceService>, 'get' | 'bet' | 'cancelBet'>;
  const race: RaceModel = {
    id: 12,
    name: 'Paris',
    ponies: [
      { id: 1, name: 'Gentle Pie', color: 'YELLOW' },
      { id: 2, name: 'Big Soda', color: 'ORANGE' },
      { id: 3, name: 'Gentle Bottle', color: 'PURPLE' },
      { id: 4, name: 'Superb Whiskey', color: 'GREEN' },
      { id: 5, name: 'Fast Rainbow', color: 'BLUE' }
    ],
    startInstant: '2024-02-18T08:02:00'
  };

  beforeEach(() => {
    raceService = {
      get: vi.fn().mockName('RaceService.get'),
      bet: vi.fn().mockName('RaceService.bet'),
      cancelBet: vi.fn().mockName('RaceService.cancelBet')
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'races/:raceId', component: Bet }], withComponentInputBinding()),
        { provide: RaceService, useValue: raceService }
      ]
    });
  });

  it('should display a race, its date and its ponies', async () => {
    raceService.get.mockImplementation(mockRaceResource(race));

    const tester = new BetTester(await RouterTestingHarness.create('/races/12'));

    expect(raceService.get).toHaveBeenCalledWith(expect.any(Function));

    const raceId = raceService.get.mock.lastCall!.at(0)!;

    expect(raceId()).toBe(12);

    // then we should have the name and ponies displayed in the template
    await expect.element(tester.ponies).toHaveLength(5);

    await expect.element(tester.title).toHaveTextContent('Paris');

    const expectedStartInstant = formatDistanceToNowStrict(parseISO(race.startInstant), { addSuffix: true });

    await expect.element(page.getByText(expectedStartInstant)).toBeVisible();
  });

  it('should trigger a bet when a pony is clicked', async () => {
    // given a race in Paris with 5 ponies, and the same race with pony 1 being bet at the second call
    const modifiedRace = { ...race, betPonyId: 1 };
    raceService.get.mockImplementation(mockRaceResource(race, modifiedRace));

    const tester = new BetTester(await RouterTestingHarness.create('/races/12'));

    expect(raceService.get).toHaveBeenCalledWith(expect.any(Function));

    // when we emit a `ponySelected` event
    raceService.bet.mockReturnValue(of(undefined));

    await tester.gentlePieFigure.click();

    expect(raceService.bet).toHaveBeenCalledWith(12, 1);

    // we should have the gentle pie pony element with the `selected` class
    await expect.element(tester.selectedPonyWrappers).toHaveLength(1);
    await expect.element(tester.selectedPonyWrappers).toHaveTextContent('Gentle Pie');
  });

  it('should display an error message if bet failed', async () => {
    // given a race in Paris with 5 ponies
    raceService.get.mockImplementation(mockRaceResource(race));

    const tester = new BetTester(await RouterTestingHarness.create('/races/12'));

    expect(raceService.get).toHaveBeenCalledWith(expect.any(Function));

    raceService.bet.mockImplementation(() => throwError(() => new Error('Oops')));

    await expect.element(tester.alert).not.toBeInTheDocument();

    // bet on pony
    await tester.gentlePieFigure.click();

    await expect.element(tester.alert).toBeVisible();
    await expect.element(tester.alert).toHaveTextContent('The race is already started or finished');
    await expect.element(tester.alert).toHaveClass('alert-danger');

    // close the alert
    await expect.element(tester.alert).toHaveClass('alert-danger');
    await expect.element(tester.alertCloseButton).toBeVisible();

    await tester.alertCloseButton.click();

    await expect.element(tester.alert).not.toBeInTheDocument();
  });

  it('should display a loading message while loading the race', async () => {
    raceService.get.mockImplementation(mockRaceResourceLoading());

    const tester = new BetTester(await RouterTestingHarness.create('/races/12'));

    await expect.element(tester.loading).toBeVisible();
    await expect.element(tester.loading).toHaveTextContent('Loading.');
    await expect.element(tester.title).not.toBeInTheDocument();
    await expect.element(tester.ponies).toHaveLength(0);
  });

  it('should display an error message if loading the race failed', async () => {
    raceService.get.mockImplementation(mockRaceResourceError());

    const tester = new BetTester(await RouterTestingHarness.create('/races/12'));

    await expect.element(tester.alert).toBeVisible();
    await expect.element(tester.alert).toHaveTextContent('An error occurred while loading the race.');
    await expect.element(tester.alert).toHaveClass('alert-danger');
    await expect.element(tester.title).not.toBeInTheDocument();
    await expect.element(tester.ponies).toHaveLength(0);
  });

  it('should cancel a bet', async () => {
    // given a race in Paris with 5 ponies and the one with ID 1 is bet, and the same race no pony being bet at the second call
    const modifiedRace = { ...race, betPonyId: 1 };
    raceService.get.mockImplementation(mockRaceResource(modifiedRace, race));

    const tester = new BetTester(await RouterTestingHarness.create('/races/12'));

    await expect.element(tester.selectedPonyWrappers).toHaveLength(1);
    await expect.element(tester.selectedPonyWrappers).toHaveTextContent('Gentle Pie');

    raceService.cancelBet.mockReturnValue(of(undefined));

    // cancel bet on pony
    await tester.gentlePieFigure.click();

    expect(raceService.cancelBet).toHaveBeenCalledWith(12);

    // we should have no element with the `selected` class
    await expect.element(tester.selectedPonyWrappers).toHaveLength(0);
  });

  it('should display a message if canceling a bet fails', async () => {
    // given a race in Paris with 5 ponies and the one with ID 1 being bet
    const modifiedRace = { ...race, betPonyId: 1 };
    raceService.get.mockImplementation(mockRaceResource(modifiedRace));

    const tester = new BetTester(await RouterTestingHarness.create('/races/12'));

    await expect.element(tester.selectedPonyWrappers).toHaveLength(1);
    await expect.element(tester.selectedPonyWrappers).toHaveTextContent('Gentle Pie');

    raceService.cancelBet.mockImplementation(() => throwError(() => new Error('Oops')));

    await expect.element(tester.alert).not.toBeInTheDocument();

    // cancel bet on pony
    await tester.gentlePieFigure.click();

    expect(raceService.cancelBet).toHaveBeenCalledWith(12);

    // gentle pie should still have the `selected` class
    await expect.element(tester.selectedPonyWrappers).toHaveLength(1);
    await expect.element(tester.selectedPonyWrappers).toHaveTextContent('Gentle Pie');

    await expect.element(tester.alert).toBeVisible();
    await expect.element(tester.alert).toHaveTextContent('The race is already started or finished');
  });
});
