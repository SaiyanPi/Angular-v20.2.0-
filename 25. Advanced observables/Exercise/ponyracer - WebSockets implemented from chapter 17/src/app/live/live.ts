import { Component, computed, inject, input, numberAttribute } from '@angular/core';
import { RaceService } from '../services/race-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { RaceModel } from '../models/race-model';
import { catchError, EMPTY, filter, map, of, scan, startWith, Subject, switchMap, Timestamp, timestamp } from 'rxjs';
import { Pony } from "../pony/pony";
import { PonyWithPositionModel } from '../models/pony-model';
import { PrettyDatePipe } from "../shared/pipes/pretty-date-pipe";

interface RaceModelWithPositions extends RaceModel {
  poniesWithPosition: Array<PonyWithPositionModel>;
  liveError?: boolean;
}

@Component({
  selector: 'pr-live',
  imports: [Pony, PrettyDatePipe],
  templateUrl: './live.html',
  styleUrl: './live.css'
})
export class Live {
  private readonly raceService = inject(RaceService);
  readonly raceId = input.required({ transform: numberAttribute });

  protected readonly initialRace = this.raceService.get(() => this.raceId());
  private readonly liveRace = rxResource<RaceModelWithPositions, RaceModel | undefined>({
    params: () => {
      if (!this.initialRace.hasValue()) {
        return undefined;
      }
      // return this.initialRace.value();
      const race = this.initialRace.value();
      return race.status === 'FINISHED' ? undefined : race;
    },
    stream: ({ params: race }) =>
      this.raceService.live(race.id).pipe(
        map(live => ({ ...race, poniesWithPosition: live.ponies, status: live.status })),
        startWith({ ...race, poniesWithPosition: [] }),
        catchError(() => of({ ...​race, poniesWithPosition: [], liveError: true }))
      )
  });

  protected readonly raceModel = computed<RaceModelWithPositions | undefined>(() => {
    if (!this.initialRace.hasValue()) {
      return undefined;
    }
    const race = this.initialRace.value();
    if (race.status === 'FINISHED') {
      return { ...race, poniesWithPosition: [] };
    }
    return this.liveRace.hasValue() ? this.liveRace.value() : { ...race, poniesWithPosition: [] };
  });

  // protected readonly winners = computed<PonyWithPositionModel[] | undefined>(() =>
  //   this.raceModel()?.poniesWithPosition.filter(p => p.position >= 100)
  // );
  protected readonly winners = computed(() =>
    this.raceModel()?.poniesWithPosition.filter(pony => pony.position >= 100));

  // protected readonly betWon = computed<boolean | undefined>(() =>
  //   this.winners()?.some(p => p.id === this.raceModel()?.betPonyId)
  // );
  protected readonly betWon = computed(() =>
    this.winners()?.some(pony => pony.id === this.raceModel()?.betPonyId));

  protected readonly clickSubject = new Subject<PonyWithPositionModel>();

  constructor() {
    this.clickSubject
      .pipe(
        timestamp(),
        scan((acc: Array<Timestamp<PonyWithPositionModel>>, click) => {
          if (acc.length === 5) {
            return [click];
          } else {
            return [...acc, click]
            .filter(c => c.value.id === click.value.id && c.timestamp > click.timestamp - 1000);
          }
        }, []),
        filter(clicks => clicks.length === 5),
        map(clicks => clicks[0].value.id),
        switchMap(ponyId => this.raceService.boost(this.raceModel()!.id, ponyId).pipe(catchError(() => EMPTY)))
      )
      .subscribe();
  }

  protected onSelection(pony: PonyWithPositionModel): void {
    this.clickSubject.next(pony);
  }

}
