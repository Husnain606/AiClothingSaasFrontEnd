import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [AlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', 'Test message');
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display success alert', () => {
    fixture.componentRef.setInput('type', 'success');
    fixture.detectChanges();
    expect(component.getAlertClass()).toContain('alert-success');
  });

  it('should display error alert', () => {
    fixture.componentRef.setInput('type', 'error');
    fixture.detectChanges();
    expect(component.getAlertClass()).toContain('alert-danger');
  });

  it('should display warning alert', () => {
    fixture.componentRef.setInput('type', 'warning');
    fixture.detectChanges();
    expect(component.getAlertClass()).toContain('alert-warning');
  });

  it('should display info alert', () => {
    fixture.componentRef.setInput('type', 'info');
    fixture.detectChanges();
    expect(component.getAlertClass()).toContain('alert-info');
  });

  it('should get correct icon for success', () => {
    component.type = 'success';
    expect(component.getIconClass()).toContain('bi-check-circle-fill');
  });

  it('should dismiss alert when close button is clicked', () => {
    vi.spyOn(component.dismissed, 'emit');
    component.onDismiss();
    expect(component.isVisible).toBe(false);
    expect(component.dismissed.emit).toHaveBeenCalled();
  });

  it('should auto-dismiss after timeout', () => {
    vi.useFakeTimers();
    component.autoDismissMs = 1000;
    component.isVisible = true;
    component.ngOnInit();
    expect(component.isVisible).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(component.isVisible).toBe(false);
  });

  it('should not auto-dismiss if autoDismissMs is 0', () => {
    vi.useFakeTimers();
    component.autoDismissMs = 0;
    component.isVisible = true;
    component.ngOnInit();
    expect(component.isVisible).toBe(true);
    vi.advanceTimersByTime(5000);
    expect(component.isVisible).toBe(true);
  });

  it('should hide close button when not dismissible', () => {
    fixture.componentRef.setInput('dismissible', false);
    fixture.detectChanges();
    const closeBtn = fixture.nativeElement.querySelector('.btn-close');
    expect(closeBtn).toBeFalsy();
  });

  it('should display message', () => {
    fixture.detectChanges();
    const messageEl = fixture.nativeElement.querySelector('.alert p');
    expect(messageEl.textContent).toContain('Test message');
  });

  it('should clean up timeout on destroy', () => {
    vi.useFakeTimers();
    component.autoDismissMs = 5000;
    component.isVisible = true;
    component.ngOnInit();
    component.ngOnDestroy();
    vi.advanceTimersByTime(5000);
    expect(component.isVisible).toBe(true);
  });
});
