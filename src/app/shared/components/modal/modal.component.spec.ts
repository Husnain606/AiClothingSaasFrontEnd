import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    component.title = 'Test Title';
    component.content = 'Test Content';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title and content', () => {
    fixture.detectChanges();
    const titleEl = fixture.nativeElement.querySelector('.modal-title');
    const contentEl = fixture.nativeElement.querySelector('.modal-body p');
    expect(titleEl.textContent).toContain('Test Title');
    expect(contentEl.textContent).toContain('Test Content');
  });

  it('should emit confirmed event when confirm button is clicked', () => {
    vi.spyOn(component.confirmed, 'emit');
    component.onConfirm();
    expect(component.confirmed.emit).toHaveBeenCalled();
  });

  it('should emit cancelled event when cancel button is clicked', () => {
    vi.spyOn(component.cancelled, 'emit');
    component.onCancel();
    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('should hide modal when confirm is called', () => {
    component.isVisible = true;
    component.onConfirm();
    expect(component.isVisible).toBe(false);
  });

  it('should hide modal when cancel is called', () => {
    component.isVisible = true;
    component.onCancel();
    expect(component.isVisible).toBe(false);
  });

  it('should return correct icon for info type', () => {
    component.type = 'info';
    expect(component.getIconClass()).toContain('bi-info-circle');
  });

  it('should return correct icon for warning type', () => {
    component.type = 'warning';
    expect(component.getIconClass()).toContain('bi-exclamation-triangle');
  });

  it('should return correct icon for danger type', () => {
    component.type = 'danger';
    expect(component.getIconClass()).toContain('bi-exclamation-circle');
  });

  it('should return correct header class for type', () => {
    component.type = 'danger';
    expect(component.getHeaderClass()).toContain('bg-danger');
  });

  it('should return correct confirm button class for type', () => {
    component.type = 'warning';
    expect(component.getConfirmButtonClass()).toContain('btn-warning');
  });

  it('should display custom button text', () => {
    fixture.componentRef.setInput('confirmText', 'Proceed');
    fixture.componentRef.setInput('cancelText', 'Abort');
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.modal-footer button');
    expect(buttons[0].textContent).toContain('Abort');
    expect(buttons[1].textContent).toContain('Proceed');
  });
});
