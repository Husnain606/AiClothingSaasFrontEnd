import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [NotFoundComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a large 404 code', () => {
    const code = fixture.nativeElement.querySelector('.not-found__code');
    expect(code).toBeTruthy();
    expect(code.textContent).toContain('404');
  });

  it('should display a friendly message', () => {
    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading).toBeTruthy();
    expect(heading.textContent!.length).toBeGreaterThan(0);
  });

  it('should link back to the product catalog', () => {
    const cta: HTMLAnchorElement | null = fixture.nativeElement.querySelector('a.btn');
    expect(cta).toBeTruthy();
    expect(cta!.getAttribute('href')).toBe('/products');
    expect(cta!.textContent).toContain('Back to shopping');
  });
});
