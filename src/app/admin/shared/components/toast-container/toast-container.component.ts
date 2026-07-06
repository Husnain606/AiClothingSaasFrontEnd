import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private sub?: Subscription;

  constructor(private toastService: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // ToastService emits from setTimeout (auto-dismiss) and from external
    // callers; under zoneless change detection no CD pass is scheduled
    // automatically for those, so mark the view dirty explicitly.
    this.sub = this.toastService.toasts$.subscribe((toasts) => {
      this.toasts = toasts;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onDismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  kindClass(kind: string): string {
    const map: Record<string, string> = {
      success: 'text-bg-success',
      error: 'text-bg-danger',
      info: 'text-bg-info',
      warning: 'text-bg-warning',
    };
    return map[kind] ?? 'text-bg-secondary';
  }
}
