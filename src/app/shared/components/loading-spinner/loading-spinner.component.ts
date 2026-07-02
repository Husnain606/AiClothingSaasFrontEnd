import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
})
export class LoadingSpinnerComponent {
  @Input() fullPage = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() message?: string;

  getSizeClass(): string {
    switch (this.size) {
      case 'sm':
        return 'spinner-sm';
      case 'lg':
        return 'spinner-lg';
      case 'md':
      default:
        return 'spinner-md';
    }
  }
}
