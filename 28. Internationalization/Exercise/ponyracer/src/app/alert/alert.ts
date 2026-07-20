import { booleanAttribute, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'pr-alert',
  imports: [],
  templateUrl: './alert.html',
  styleUrl: './alert.css'
})
export class Alert {
  readonly closed = output<void>();
  readonly type = input<'success' | 'danger' | 'warning'>('warning');
  readonly dismissible = input(true, { transform: booleanAttribute });
  protected closeHandler(): void {
    this.closed.emit();
  }

  protected readonly alertClasses = computed(() =>
    [this.dismissible() ? 'alert-dismissible' : '', `alert-${this.type()}`] as const)
}
