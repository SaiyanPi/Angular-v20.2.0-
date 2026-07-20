import { Component, computed, input, output, ChangeDetectionStrategy } from '@angular/core';
import { PonyModel } from '../models/pony-model';

@Component({
  selector: 'pr-pony',
  imports: [],
  templateUrl: './pony.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pony.css'
})
export class Pony {
  readonly ponyModel = input.required<PonyModel>();
  readonly ponySelected = output<PonyModel>();

  protected selectPony(): void {
    this.ponySelected.emit(this.ponyModel());
  }

  readonly isRunning = input(false);
  readonly isBoosted = input(false);

  protected readonly ponyImageUrl = computed(
    () => `images/pony-${this.ponyModel().color.toLowerCase()}${this.isBoosted() ? '-rainbow' : this.isRunning() ? '-running' : ''}.gif`
  );


}
