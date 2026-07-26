import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { PaymentFormComponent } from './payment-form.component';

describe('PaymentFormComponent', () => {
  let component: PaymentFormComponent;
  let fixture: ComponentFixture<PaymentFormComponent>;
  let httpMock: HttpTestingController;

  const instructionsUrl = `${environment.apiBaseUrl}/${environment.tenantSlug}/payment-instructions`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentFormComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock = TestBed.inject(HttpTestingController);
    const req = httpMock.expectOne(instructionsUrl);
    req.flush({
      statusCode: 200,
      message: 'OK',
      data: 'Pay via bank transfer to Acme Bank, Account 12345.',
      errors: null,
      timestamp: '2026-01-01T00:00:00Z'
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and expose payment instructions on init', () => {
    expect(component.paymentInstructions()).toBe('Pay via bank transfer to Acme Bank, Account 12345.');
  });

  it('rejects a disallowed content type', () => {
    const file = new File(['x'], 'evil.exe', { type: 'application/x-msdownload' });
    component.onFileSelected({ target: { files: [file] } } as unknown as Event);
    expect(component.selectedFile).toBeNull();
    expect(component.errorMessage).toContain('JPEG');
  });

  it('rejects a file over 10 MB', () => {
    const big = new File([new ArrayBuffer(10485761)], 'big.pdf', { type: 'application/pdf' });
    component.onFileSelected({ target: { files: [big] } } as unknown as Event);
    expect(component.selectedFile).toBeNull();
    expect(component.errorMessage).toContain('10 MB');
  });

  it('accepts a valid PDF', () => {
    const file = new File(['%PDF-1.7'], 'receipt.pdf', { type: 'application/pdf' });
    component.onFileSelected({ target: { files: [file] } } as unknown as Event);
    expect(component.selectedFile).toBe(file);
    expect(component.errorMessage).toBe('');
  });

  it('does not emit when no file is attached', () => {
    let emitted = false;
    component.submitted.subscribe(() => {
      emitted = true;
    });

    component.onSubmit();
    expect(emitted).toBe(false);
    expect(component.errorMessage).toBe('Payment proof is required.');
  });

  it('emits the PaymentProof on submit once a file is attached', () => {
    const file = new File(['%PDF-1.7'], 'receipt.pdf', { type: 'application/pdf' });
    component.onFileSelected({ target: { files: [file] } } as unknown as Event);

    let emitted = false;
    component.submitted.subscribe((paymentProof) => {
      expect(paymentProof.file).toBe(file);
      expect(paymentProof.fileName).toBe('receipt.pdf');
      emitted = true;
    });

    component.onSubmit();
    expect(emitted).toBe(true);
  });
});
