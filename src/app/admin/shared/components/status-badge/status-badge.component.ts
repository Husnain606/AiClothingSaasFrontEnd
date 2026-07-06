import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

const COLOR_MAP: Record<string, string> = {
  pending: 'text-bg-secondary',
  confirmed: 'text-bg-primary',
  shipped: 'text-bg-info',
  delivered: 'text-bg-success',
  cancelled: 'text-bg-danger',
  approved: 'text-bg-success',
  rejected: 'text-bg-danger',
  active: 'text-bg-success',
  inactive: 'text-bg-secondary',
  suspended: 'text-bg-warning',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [class]="colorClass">{{ label }}</span>`,
})
export class StatusBadgeComponent {
  @Input() status = '';

  get colorClass(): string {
    return COLOR_MAP[this.status.toLowerCase()] ?? 'text-bg-secondary';
  }

  get label(): string {
    return this.status.length ? this.status[0].toUpperCase() + this.status.slice(1) : '';
  }
}
