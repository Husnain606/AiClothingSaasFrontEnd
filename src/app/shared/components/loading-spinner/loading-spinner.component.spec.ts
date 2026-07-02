import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default size md', () => {
    expect(component.size).toBe('md');
  });

  it('should return correct size class for sm', () => {
    component.size = 'sm';
    expect(component.getSizeClass()).toBe('spinner-sm');
  });

  it('should return correct size class for md', () => {
    component.size = 'md';
    expect(component.getSizeClass()).toBe('spinner-md');
  });

  it('should return correct size class for lg', () => {
    component.size = 'lg';
    expect(component.getSizeClass()).toBe('spinner-lg');
  });

  it('should display message when provided', () => {
    fixture.componentRef.setInput('message', 'Loading...');
    fixture.detectChanges();
    const messageEl = fixture.nativeElement.querySelector('.spinner-message');
    expect(messageEl).toBeTruthy();
    expect(messageEl.textContent).toContain('Loading...');
  });

  it('should not display message when not provided', () => {
    fixture.componentRef.setInput('message', undefined);
    fixture.detectChanges();
    const messageEl = fixture.nativeElement.querySelector('.spinner-message');
    expect(messageEl).toBeFalsy();
  });

  it('should add spinner-overlay class when fullPage is true', () => {
    fixture.componentRef.setInput('fullPage', true);
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.spinner-overlay');
    expect(overlay).toBeTruthy();
  });
});
