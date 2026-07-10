import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent implements OnChanges, AfterViewChecked {
  @Input() isOpen = false;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() tone: 'primary' | 'danger' = 'primary';
  @Input() requireTypedConfirmation?: string;
  @Input() requireReason = false;
  @Input() reasonLabel = 'Reason';
  @Output() confirmed = new EventEmitter<string | undefined>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('dialogEl') dialogEl?: ElementRef<HTMLElement>;
  @ViewChild('typedConfirmEl') typedConfirmEl?: ElementRef<HTMLElement>;
  @ViewChild('reasonEl') reasonEl?: ElementRef<HTMLElement>;
  @ViewChild('cancelBtnEl') cancelBtnEl?: ElementRef<HTMLElement>;

  typedValue = '';
  reasonValue = '';

  private previouslyFocused: HTMLElement | null = null;
  private focusHandled = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.typedValue = '';
        this.reasonValue = '';
        this.previouslyFocused = (document.activeElement as HTMLElement) ?? null;
        this.focusHandled = false;
      } else if (changes['isOpen'].previousValue) {
        this.restoreFocus();
      }
    }
  }

  ngAfterViewChecked(): void {
    if (this.isOpen && !this.focusHandled) {
      const target =
        this.typedConfirmEl?.nativeElement ??
        this.reasonEl?.nativeElement ??
        this.cancelBtnEl?.nativeElement ??
        this.dialogEl?.nativeElement;
      target?.focus();
      this.focusHandled = true;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.onCancel();
    }
  }

  get canConfirm(): boolean {
    return !this.requireTypedConfirmation || this.typedValue === this.requireTypedConfirmation;
  }

  onConfirm(): void {
    if (this.canConfirm) {
      this.confirmed.emit(this.requireReason ? this.reasonValue : undefined);
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private restoreFocus(): void {
    this.previouslyFocused?.focus();
    this.previouslyFocused = null;
  }
}
