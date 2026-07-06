import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastContainerComponent } from './toast-container.component';
import { ToastService } from '../../services/toast.service';

describe('ToastContainerComponent', () => {
  let fixture: ComponentFixture<ToastContainerComponent>;
  let component: ToastContainerComponent;
  let toastService: ToastService;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
      providers: [ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a toast pushed through the service', () => {
    toastService.success('Saved!');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Saved!');
  });

  it('renders the correct Bootstrap class per toast kind', () => {
    toastService.error('Failed!');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.toast');
    expect(el.className).toContain('text-bg-danger');
  });

  it('removes a toast from the DOM when dismissed', () => {
    toastService.success('Bye');
    fixture.detectChanges();
    const [toast] = component.toasts;
    component.onDismiss(toast.id);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Bye');
  });
});
