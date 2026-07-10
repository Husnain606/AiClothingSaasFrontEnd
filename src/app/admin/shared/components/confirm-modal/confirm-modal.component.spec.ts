import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  let fixture: ComponentFixture<ConfirmModalComponent>;
  let component: ConfirmModalComponent;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [ConfirmModalComponent] }).compileComponents();
    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('title', 'Cancel order');
    fixture.componentRef.setInput('message', 'This cannot be undone.');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not render when isOpen is false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal')).toBeFalsy();
  });

  it('emits confirmed when the confirm button is clicked and no typed confirmation is required', () => {
    vi.spyOn(component.confirmed, 'emit');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="confirm-btn"]');
    button.click();
    expect(component.confirmed.emit).toHaveBeenCalled();
  });

  it('emits cancelled when the cancel button is clicked', () => {
    vi.spyOn(component.cancelled, 'emit');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="cancel-btn"]');
    button.click();
    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('disables confirm until the typed confirmation matches', () => {
    fixture.componentRef.setInput('requireTypedConfirmation', 'my-tenant');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="confirm-btn"]');
    expect(button.disabled).toBe(true);

    const input: HTMLInputElement = fixture.nativeElement.querySelector('#typedConfirm');
    input.value = 'my-tenant';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.typedValue).toBe('my-tenant');
    expect(button.disabled).toBe(false);
  });

  it('resets the typed value when reopened', () => {
    fixture.componentRef.setInput('requireTypedConfirmation', 'my-tenant');
    component.typedValue = 'my-tenant';
    fixture.componentRef.setInput('isOpen', false);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    expect(component.typedValue).toBe('');
  });

  it('has aria-modal on the dialog', () => {
    const el = fixture.nativeElement.querySelector('.modal');
    expect(el.getAttribute('aria-modal')).toBe('true');
  });

  it('emits cancelled on Escape keydown', () => {
    vi.spyOn(component.cancelled, 'emit');
    component.onEscape();
    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('does not emit cancelled on Escape when closed', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    vi.spyOn(component.cancelled, 'emit');
    component.onEscape();
    expect(component.cancelled.emit).not.toHaveBeenCalled();
  });

  it('moves focus into the modal when opened', () => {
    fixture.detectChanges();
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector('[data-testid="cancel-btn"]')
    );
  });

  it('renders the reason input inside the dialog when requireReason is set', () => {
    fixture.componentRef.setInput('requireReason', true);
    fixture.componentRef.setInput('reasonLabel', 'Rejection reason');
    fixture.detectChanges();

    const dialog: HTMLElement = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    const reasonInput: HTMLInputElement | null = dialog.querySelector('#confirmReason');
    expect(reasonInput).toBeTruthy();
    expect(dialog.querySelector('label[for="confirmReason"]')?.textContent).toContain('Rejection reason');
  });

  it('moves focus to the reason input when requireReason is set', () => {
    fixture.componentRef.setInput('requireReason', true);
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('#confirmReason'));
  });

  it('emits the typed reason text on confirm when requireReason is set', () => {
    fixture.componentRef.setInput('requireReason', true);
    fixture.detectChanges();

    vi.spyOn(component.confirmed, 'emit');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#confirmReason');
    input.value = 'Inappropriate content';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="confirm-btn"]');
    button.click();

    expect(component.confirmed.emit).toHaveBeenCalledWith('Inappropriate content');
  });

  it('emits undefined on confirm when requireReason is not set', () => {
    vi.spyOn(component.confirmed, 'emit');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="confirm-btn"]');
    button.click();

    expect(component.confirmed.emit).toHaveBeenCalledWith(undefined);
  });

  it('restores focus to the previously focused element on close', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();

    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });
});
