import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LazyLoadImageDirective } from './lazy-load-image.directive';

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(public callback: IntersectionObserverCallback) {}
}

@Component({
  template: '<img appLazyLoadImage="test.jpg" placeholderUrl="placeholder.jpg">',
  standalone: true,
  imports: [LazyLoadImageDirective],
})
class TestComponent {}

describe('LazyLoadImageDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let el: DebugElement;

  beforeEach(async () => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    TestBed.resetTestingModule();


    await TestBed.configureTestingModule({
      imports: [TestComponent, LazyLoadImageDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement.query(By.directive(LazyLoadImageDirective));
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete (window as any).IntersectionObserver;
  });

  it('should create an instance', () => {
    const directive = el.injector.get(LazyLoadImageDirective);
    expect(directive).toBeTruthy();
  });

  it('should load image if IntersectionObserver is not available', () => {
    delete (window as any).IntersectionObserver;

    const fixture2 = TestBed.createComponent(TestComponent);
    const el2 = fixture2.debugElement.query(By.directive(LazyLoadImageDirective));
    fixture2.detectChanges();

    expect(el2.nativeElement.src).toContain('test.jpg');
  });

  it('should set placeholder image initially', () => {
    expect(el.nativeElement.src).toContain('placeholder.jpg');
  });

  it('should load image when it intersects', () => {
    const directive = el.injector.get(LazyLoadImageDirective);
    const observer = directive['observer'] as unknown as MockIntersectionObserver;
    expect(observer.observe).toHaveBeenCalledWith(el.nativeElement);

    observer.callback(
      [{ isIntersecting: true, target: el.nativeElement } as unknown as IntersectionObserverEntry],
      observer as unknown as IntersectionObserver
    );

    expect(el.nativeElement.src).toContain('test.jpg');
    expect(observer.unobserve).toHaveBeenCalledWith(el.nativeElement);
  });

  it('should disconnect observer on destroy', () => {
    const directive = el.injector.get(LazyLoadImageDirective);
    vi.spyOn(directive['observer']!, 'disconnect');
    directive.ngOnDestroy();
    expect(directive['observer']!.disconnect).toHaveBeenCalled();
  });
});
