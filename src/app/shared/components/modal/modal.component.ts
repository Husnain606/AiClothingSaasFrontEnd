import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() isVisible = true;
  @Input() title!: string;
  @Input() content!: string;
  @Input() confirmText = 'OK';
  @Input() cancelText = 'Cancel';
  @Input() type: 'info' | 'warning' | 'danger' = 'info';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
    this.isVisible = false;
  }

  onCancel(): void {
    this.cancelled.emit();
    this.isVisible = false;
  }

  getIconClass(): string {
    const iconMap = {
      info: 'bi-info-circle',
      warning: 'bi-exclamation-triangle',
      danger: 'bi-exclamation-circle',
    };
    return `bi ${iconMap[this.type]}`;
  }

  getHeaderClass(): string {
    const classMap = {
      info: 'bg-info',
      warning: 'bg-warning',
      danger: 'bg-danger',
    };
    return classMap[this.type];
  }

  getConfirmButtonClass(): string {
    const classMap = {
      info: 'btn-primary',
      warning: 'btn-warning',
      danger: 'btn-danger',
    };
    return classMap[this.type];
  }
}
