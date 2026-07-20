import { Component, inject, input, numberAttribute, signal } from '@angular/core';
import { RaceService } from '../services/race-service';
import { PrettyDatePipe } from '../shared/pipes/pretty-date-pipe';
import { PonyModel } from '../models/pony-model';
import { Pony } from "../pony/pony";
import { RouterLink } from '@angular/router';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { TranslocoDirective } from '@jsverse/transloco';


@Component({
  selector: 'pr-bet',
  imports: [PrettyDatePipe, Pony, RouterLink, NgbAlert, TranslocoDirective],
  templateUrl: './bet.html',
  styleUrl: './bet.css'
})
export class Bet {
  private readonly raceService = inject(RaceService);
  readonly raceId = input.required({ transform: numberAttribute });
  protected readonly raceModel = this.raceService.get(() => this.raceId());
  protected readonly betFailed = signal(false);

  protected betOnPony(pony: PonyModel): void {
    this.betFailed.set(false);
    const race = this.raceModel.value()!;
    const result$ = this.isPonySelected(pony) ? this.raceService.cancelBet(race.id) : this.raceService.bet(race.id, pony.id);
    result$.subscribe({
      next: () => this.raceModel.reload(),
      error: () => this.betFailed.set(true)
    });
  }

  protected isPonySelected(pony: PonyModel): boolean {
    return pony.id === this.raceModel.value()!.betPonyId;
  }
}

