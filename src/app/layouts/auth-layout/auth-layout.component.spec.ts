import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthLayoutComponent } from './auth-layout.component';

describe('AuthLayoutComponent', () => {
  let component: AuthLayoutComponent;
  let fixture: ComponentFixture<AuthLayoutComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [AuthLayoutComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a router outlet', () => {
    const outlet = fixture.nativeElement.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });

  it('should not render the header or footer', () => {
    expect(fixture.nativeElement.querySelector('app-header')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-footer')).toBeNull();
  });

  it('should render a brand link back to home', () => {
    const brand: HTMLAnchorElement | null =
      fixture.nativeElement.querySelector('a.auth-shell__brand');
    expect(brand).toBeTruthy();
    expect(brand!.getAttribute('href')).toBe('/');
    expect(brand!.textContent).toContain('FashionSaaS');
  });

  it('should center content in a full-height shell', () => {
    const shell = fixture.nativeElement.querySelector('.auth-shell');
    expect(shell).toBeTruthy();
    expect(shell.classList.contains('justify-content-center')).toBe(true);
    expect(shell.classList.contains('align-items-center')).toBe(true);
  });
});
