import { Component, OnInit, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentProof } from '../../models/checkout.model';
import { ApiService } from '../../../../core/services/api.service';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { environment } from '@env/environment';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_BYTES = 10485760;

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
  @Output() submitted = new EventEmitter<PaymentProof>();

  private readonly api = inject(ApiService);

  selectedFile: File | null = null;
  errorMessage = '';

  // A signal, not a plain field: this app runs zoneless change detection
  // (provideZonelessChangeDetection in app.config.ts), so a plain field mutated
  // inside an RxJS subscribe callback would never trigger a re-render — only
  // signal writes (or an async-piped Observable) do. Confirmed via live
  // verification: a plain field left the view stuck on the fallback message
  // even though the HTTP response carried real instructions text.
  paymentInstructions = signal('');

  ngOnInit() {
    this.api
      .get<string>(`${environment.tenantSlug}/payment-instructions`)
      .subscribe({
        next: (response: ApiResponse<string>) => this.paymentInstructions.set(response.data ?? ''),
        // Instructions are informational; a failure must not block the upload.
        error: () => this.paymentInstructions.set('')
      });
  }

  onFileSelected(event: Event): void {
    this.errorMessage = '';
    this.selectedFile = null;

    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.errorMessage = 'Please upload a JPEG, PNG, WebP or PDF file.';
      return;
    }

    if (file.size > MAX_BYTES) {
      this.errorMessage = 'File must be 10 MB or smaller.';
      return;
    }

    this.selectedFile = file;
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Payment proof is required.';
      return;
    }

    this.submitted.emit({ file: this.selectedFile, fileName: this.selectedFile.name });
  }
}
