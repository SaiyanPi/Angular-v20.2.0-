import { Component, computed, input, output } from '@angular/core';
import { PonyModel } from '../models/pony-model';

@Component({
  selector: 'pr-pony',
  imports: [],
  templateUrl: './pony.html',
  styleUrl: './pony.css'
})
export class Pony {
  readonly ponyModel = input.required<PonyModel>();
  protected readonly ponyImageUrl = computed(() => `images/pony-${this.ponyModel().color.toLowerCase()}.gif`);
  readonly ponySelected = output<PonyModel>();

  protected selectPony(): void {
    this.ponySelected.emit(this.ponyModel());
  }

  // Exercise 6:
  // 1️⃣Create a computed signal in your component named ponyImageUrl(). It should return the full path
  // of the image based on the color of the pony.
  // 4️⃣Our component must also fire a custom event ponySelected when the user clicks on the element.
  //  To achieve that, add a click listener on the root element of the template, calling a method of the
  //  component. This method will emit the pony using an output<PonyModel>() named ponySelected.
}
