import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateRangePickerComponent } from './date-range-picker.component';

describe('DateRangePickerComponent', () => {
  let fixture: ComponentFixture<DateRangePickerComponent>;
  let component: DateRangePickerComponent;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [DateRangePickerComponent] }).compileComponents();
    fixture = TestBed.createComponent(DateRangePickerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('range', { from: '2026-06-01', to: '2026-07-01' });
    fixture.detectChanges();
  });

  it('renders the current from/to values in the inputs', () => {
    const fromInput: HTMLInputElement = fixture.nativeElement.querySelector('#from-date');
    const toInput: HTMLInputElement = fixture.nativeElement.querySelector('#to-date');
    expect(fromInput.value).toBe('2026-06-01');
    expect(toInput.value).toBe('2026-07-01');
  });

  it('emits rangeChange when "from" changes and is valid (from <= to)', () => {
    const spy = vi.spyOn(component.rangeChange, 'emit');
    component.onFromChange('2026-06-15');
    expect(spy).toHaveBeenCalledWith({ from: '2026-06-15', to: '2026-07-01' });
  });

  it('does not emit when "from" would be after "to"', () => {
    const spy = vi.spyOn(component.rangeChange, 'emit');
    component.onFromChange('2026-07-15');
    expect(spy).not.toHaveBeenCalled();
    expect(component.validationError).toBeTruthy();
  });

  it('does not emit when the range exceeds 366 days (matches backend max)', () => {
    const spy = vi.spyOn(component.rangeChange, 'emit');
    component.onToChange('2028-01-01');
    expect(spy).not.toHaveBeenCalled();
    expect(component.validationError).toContain('366');
  });

  it('has labels associated with both date inputs', () => {
    const fromLabel: HTMLLabelElement = fixture.nativeElement.querySelector('label[for="from-date"]');
    const toLabel: HTMLLabelElement = fixture.nativeElement.querySelector('label[for="to-date"]');
    expect(fromLabel).toBeTruthy();
    expect(toLabel).toBeTruthy();
  });
});
