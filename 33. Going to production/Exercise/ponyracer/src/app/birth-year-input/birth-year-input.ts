import { Component, input, model, output } from '@angular/core';
import { FormValueControl, transformedValue } from '@angular/forms/signals';

@Component({
  selector: 'pr-birth-year-input',
  imports: [],
  templateUrl: './birth-year-input.html',
  styleUrl: './birth-year-input.css'
})
export class BirthYearInput implements FormValueControl<number | null> {
  readonly inputId = input.required<string>();
  readonly value = model.required<number | null>();
  readonly touched = input.required<boolean>();
  readonly touch = output<void>();
  readonly disabled = input.required<boolean>();
  readonly invalid = input.required<boolean>();
  protected readonly rawValue = transformedValue(this.value, {
    parse: (raw: number | null) => {
      return { value: raw === null || isNaN(raw) ? null : this.computeYear(raw) };
    },
    format: (value: number | null) => value ?? null
  });

  private computeYear(value: number) {
    const lastTwoDigitsOfTheCurrentYear = new Date().getFullYear() % 100;
    const firstTwoDigitsOfTheCurrentYear = Math.floor(new Date().getFullYear() / 100);
    if (value < 0 || value > 100) {
      return value;
    } else if (value > lastTwoDigitsOfTheCurrentYear) {
      return (firstTwoDigitsOfTheCurrentYear - 1) * 100 + value;
    } else {
      return firstTwoDigitsOfTheCurrentYear * 100 + value;
    }
  }

  onBirthYearInput(event: Event) {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    this.rawValue.set(value);
  }
}
