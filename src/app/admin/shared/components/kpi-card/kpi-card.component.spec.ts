import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardComponent } from './kpi-card.component';

describe('KpiCardComponent', () => {
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [KpiCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpiCardComponent);
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('value', '$12,400');
    fixture.componentRef.setInput('icon', 'cash-stack');
  });

  it('renders label and value', () => {
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Revenue');
    expect(text).toContain('$12,400');
  });

  it('renders the icon class', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('i').className).toContain('bi-cash-stack');
  });

  it('shows an up-trend indicator when trend is up', () => {
    fixture.componentRef.setInput('trend', 'up');
    fixture.componentRef.setInput('trendLabel', '+12% vs last period');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.text-success')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('+12% vs last period');
  });

  it('shows a down-trend indicator when trend is down', () => {
    fixture.componentRef.setInput('trend', 'down');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.text-danger')).toBeTruthy();
  });

  it('renders no trend indicator when trend is not provided', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.kpi-trend')).toBeFalsy();
  });
});
