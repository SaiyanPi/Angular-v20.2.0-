import { computed, Directive, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

@Directive({
  selector: 'label[prFormLabel]',
  host: {
    '[class.text-danger]': 'isInvalidAndTouched()'
  }
})
export class FormLabel {
  readonly fieldTree = input.required<FieldTree<unknown>>({ alias: 'prFormLabel' });
  protected readonly isInvalidAndTouched = computed(() => {
    const fieldTree = this.fieldTree();
    const state = fieldTree();
    return state.touched() && state.invalid();
  });
}
