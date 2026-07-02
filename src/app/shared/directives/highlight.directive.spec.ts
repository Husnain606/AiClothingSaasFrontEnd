import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HighlightDirective } from './highlight.directive';

@Component({
  template: '<div appHighlight appHighlight="yellow"></div>',
  standalone: true,
  imports: [HighlightDirective],
})
class TestComponent {}

describe('HighlightDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let el: DebugElement;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [TestComponent, HighlightDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement.query(By.directive(HighlightDirective));
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directive = el.injector.get(HighlightDirective);
    expect(directive).toBeTruthy();
  });

  it('should highlight on mouse enter', () => {
    el.nativeElement.dispatchEvent(new Event('mouseenter'));
    expect(el.nativeElement.style.backgroundColor).toBe('yellow');
  });

  it('should remove highlight on mouse leave', () => {
    el.nativeElement.dispatchEvent(new Event('mouseenter'));
    el.nativeElement.dispatchEvent(new Event('mouseleave'));
    expect(el.nativeElement.style.backgroundColor).toBe('');
  });

  it('should use default color if specified', () => {
    const directive = el.injector.get(HighlightDirective);
    directive.defaultColor = 'red';
    el.nativeElement.dispatchEvent(new Event('mouseenter'));
    el.nativeElement.dispatchEvent(new Event('mouseleave'));
    expect(el.nativeElement.style.backgroundColor).toBe('red');
  });
});
