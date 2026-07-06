import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;
  let component: StatusBadgeComponent;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [StatusBadgeComponent] }).compileComponents();
    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('renders the status text capitalized', () => {
    fixture.componentRef.setInput('status', 'confirmed');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('Confirmed');
  });

  it('applies the success color for delivered', () => {
    fixture.componentRef.setInput('status', 'delivered');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').className).toContain('text-bg-success');
  });

  it('applies the danger color for cancelled', () => {
    fixture.componentRef.setInput('status', 'cancelled');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').className).toContain('text-bg-danger');
  });

  it('applies a neutral color for an unrecognized status', () => {
    fixture.componentRef.setInput('status', 'unknown-status');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').className).toContain('text-bg-secondary');
  });
});
