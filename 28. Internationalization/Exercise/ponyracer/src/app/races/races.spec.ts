import { Location } from '@angular/common';
import { signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { delay, of } from 'rxjs';
import { page } from 'vitest/browser';
import { provideI18nTesting } from '../../i18n-test-utils';
import { routes } from '../app.routes';
import { RaceModel } from '../models/race-model';
import { UserModel } from '../models/user-model';
import { RaceService } from '../services/race-service';
import { UserService } from '../services/user-service';
import { FinishedRaces } from './finished-races/finished-races';
import { PendingRaces } from './pending-races/pending-races';

function mockRaceResource(raceOrRaces: RaceModel | Array<RaceModel>) {
  return () => rxResource({ stream: () => of(raceOrRaces).pipe(delay(5)) });
}

class RacesTester {
  readonly fixture: ComponentFixture<unknown>;
  constructor(readonly harness: RouterTestingHarness) {
    this.fixture = harness.fixture;
  }

  readonly tabLinks = page.getByCss('.nav.nav-tabs .nav-item a.nav-link');
}

describe('Races', () => {
  beforeEach(() => {
    const raceService = {
      list: vi.fn().mockName('RaceService.list'),
      get: vi.fn().mockName('RaceService.get')
    };
    const userService = { currentUser: signal({} as UserModel) };
    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        provideRouter(routes, withComponentInputBinding()),
        { provide: RaceService, useValue: raceService },
        { provide: UserService, useValue: userService }
      ]
    });
    raceService.list.mockImplementation(mockRaceResource([]));
    raceService.get.mockImplementation(mockRaceResource({ id: 12, name: 'Lyon', ponies: [], startInstant: '2024-02-18T08:02:00Z' }));
  });

  it('should redirect from /races to /races/pending', async () => {
    await RouterTestingHarness.create('/races');

    const location = TestBed.inject(Location);

    expect(location.path(), 'You should redirect from /races to /races/pending').toBe('/races/pending');
  });

  it('should show two tabs', async () => {
    const tester = new RacesTester(await RouterTestingHarness.create('/races'));

    await expect.element(tester.tabLinks).toHaveLength(2);
    await expect.element(tester.tabLinks.nth(0)).toHaveAttribute('href', '/races/pending');
    await expect.element(tester.tabLinks.nth(1)).toHaveAttribute('href', '/races/finished');
  });

  it('should make first tab active when showing pending races', async () => {
    const tester = new RacesTester(await RouterTestingHarness.create('/races'));

    await expect.element(tester.tabLinks.nth(0)).toHaveClass('active');
    await expect.element(tester.tabLinks.nth(1)).not.toHaveClass('active');
  });

  it('should make second tab active when showing finished races', async () => {
    const tester = new RacesTester(await RouterTestingHarness.create('/races/finished'));

    await expect.element(tester.tabLinks.nth(0)).not.toHaveClass('active');
    await expect.element(tester.tabLinks.nth(1)).toHaveClass('active');
  });

  it('should not show tabs when showing bet page', async () => {
    const tester = new RacesTester(await RouterTestingHarness.create('/races/12'));

    // The Bet component should not be rendered as a child route of the Races component
    // If that's the case, the tabs are visible.
    // Move Bet into its own route under 'races'
    await expect.element(tester.tabLinks).toHaveLength(0);
  });

  it('should display pending races for /races/pending and finished races for /races/finished', async () => {
    const tester = new RacesTester(await RouterTestingHarness.create('/races/pending'));

    await expect.element(tester.tabLinks).toHaveLength(2);

    const pendingRaces = tester.fixture.debugElement.query(By.directive(PendingRaces));

    expect(pendingRaces, 'You should have a PendingRaces for the /races/pending route').not.toBeNull();

    await tester.harness.navigateByUrl('/races/finished');
    const finishedRaces = tester.fixture.debugElement.query(By.directive(FinishedRaces));

    expect(finishedRaces, 'You should have a FinishedRaces for the /races/finished route').not.toBeNull();
  });
});
