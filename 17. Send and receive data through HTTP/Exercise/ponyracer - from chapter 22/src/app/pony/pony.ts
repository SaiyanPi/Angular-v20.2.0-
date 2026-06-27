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
  protected readonly ponyImageUrl = computed(() => `images/pony-${this.ponyModel().color.toLowerCase()}.gif`);
  readonly ponySelected = output<PonyModel>();

  protected selectPony(): void {
    this.ponySelected.emit(this.ponyModel());
  }
}
