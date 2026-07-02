import {
  ChangeDetectorRef,
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent implements OnInit, OnDestroy {
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() message!: string;
  @Input() dismissible = true;
  @Input() autoDismissMs = 5000;
  @Output() dismissed = new EventEmitter<void>();

  isVisible = true;
  private timeoutId?: number;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.autoDismissMs > 0) {
      this.timeoutId = window.setTimeout(() => this.onDismiss(), this.autoDismissMs);
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  onDismiss(): void {
    this.isVisible = false;
    this.dismissed.emit();
    // Auto-dismiss fires from a raw setTimeout; under zoneless change
    // detection no CD pass is scheduled, so mark the view dirty explicitly.
    this.cdr.markForCheck();
  }

  getAlertClass(): string {
    const baseClass = 'alert';
    const typeMap = {
      success: 'alert-success',
      error: 'alert-danger',
      warning: 'alert-warning',
      info: 'alert-info',
    };
    return `${baseClass} ${typeMap[this.type]}`;
  }

  getIconClass(): string {
    const iconMap = {
      success: 'bi-check-circle-fill',
      error: 'bi-exclamation-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill',
    };
    return `bi ${iconMap[this.type]}`;
  }
}
