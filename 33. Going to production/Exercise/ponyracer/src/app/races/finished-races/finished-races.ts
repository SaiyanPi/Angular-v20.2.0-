import { Component, computed, inject, input, numberAttribute } from '@angular/core';
import { RaceService } from '../../services/race-service';
import { Race } from '../../race/race';
import { NgbAlert, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { RaceModel } from '../../models/race-model';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

/**
 * The data needed by the view
 */
interface ViewModel {
  /**
   * The current page number starting at 1
   */
  page: number;

  /**
   * The total number of races
   */
  total: number;

  /**
   * The races to display for the current page
   */
  races: Array<RaceModel>;
}

@Component({
  imports: [Race, NgbAlert, NgbPagination, TranslocoDirective],
  templateUrl: './finished-races.html',
  styleUrl: './finished-races.css'
})
export class FinishedRaces {
  private readonly router = inject(Router);
  protected readonly races = inject(RaceService).list('FINISHED');
  // readonly page = input(1, { transform: numberAttribute }); // without fallback
  readonly page = input(1, { transform: (value: unknown) => numberAttribute(value, 1) }); // with fallback

  readonly vm = computed<ViewModel | undefined>(() => {
    if (!this.races.hasValue()) {
      return undefined;
    }
    const allRaces = this.races.value();
    const page = this.page();
    return {
      total: allRaces.length,
      page,
      races: allRaces.slice((page - 1) * 10, page * 10)
    };
  });

  protected changePage(page: number): void {
    this.router.navigate([], { queryParams: { page } });
  }
}
