import { Component, computed, inject, input, numberAttribute } from '@angular/core';
import { RaceService } from '../services/race-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { RaceModel } from '../models/race-model';
import { map, startWith } from 'rxjs';
import { Pony } from "../pony/pony";
import { PonyWithPositionModel } from '../models/pony-model';

interface RaceModelWithPositions extends RaceModel {
  poniesWithPosition: Array<PonyWithPositionModel>;
}

@Component({
  selector: 'pr-live',
  imports: [Pony],
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
      return this.initialRace.value();
    },
    stream: ({ params: race }) =>
    this.raceService.live(race.id).pipe(
      map(live => ({ ...race, poniesWithPosition: live.ponies, status: live.status })),
      startWith({ ...race, poniesWithPosition: [] })
    )
  });

  protected readonly raceModel = computed<RaceModelWithPositions | undefined>(() => {
    if (!this.initialRace.hasValue()) {
      return undefined;
    }
    const race = this.initialRace.value();
    return this.liveRace.hasValue() ? this.liveRace.value() : { ...race, poniesWithPosition: [] };
  });
}
