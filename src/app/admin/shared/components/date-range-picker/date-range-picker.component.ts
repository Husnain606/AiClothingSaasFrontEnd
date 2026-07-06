import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DateRange {
  from: string;
  to: string;
}

const MAX_RANGE_DAYS = 366;

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-range-picker.component.html',
})
export class DateRangePickerComponent {
  @Input({ required: true }) range!: DateRange;
  @Output() rangeChange = new EventEmitter<DateRange>();

  validationError = '';

  onFromChange(value: string): void {
    this.tryEmit({ from: value, to: this.range.to });
  }

  onToChange(value: string): void {
    this.tryEmit({ from: this.range.from, to: value });
  }

  private tryEmit(next: DateRange): void {
    const from = new Date(next.from);
    const to = new Date(next.to);
    if (from > to) {
      this.validationError = 'Start date must be before end date.';
      return;
    }
    const days = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
    if (days > MAX_RANGE_DAYS) {
      this.validationError = `Range cannot exceed ${MAX_RANGE_DAYS} days.`;
      return;
    }
    this.validationError = '';
    this.rangeChange.emit(next);
  }
}
