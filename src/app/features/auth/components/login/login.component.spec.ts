import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivatedRoute, Router, provideRouter, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: Partial<AuthService>;
  let router: Router;
  let queryParams: Record<string, string>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockAuthService = { login: vi.fn() };
    queryParams = {};

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        // Real router (with ActivatedRoute) so RouterLink in the template resolves;
        // navigation itself is stubbed below.
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { get queryParamMap() { return convertToParamMap(queryParams); } },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with email and password controls', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeDefined();
    expect(component.loginForm.get('password')).toBeDefined();
  });

  it('should have invalid form initially', () => {
    expect(component.loginForm.invalid).toBeTruthy();
  });

  it('should disable submit button when form is invalid', () => {
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: 'short',
    });
    expect(component.loginForm.invalid).toBeTruthy();
  });

  it('should enable submit button when form is valid', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should show email validation error for required field', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.markAsTouched();
    fixture.detectChanges();
    expect(emailControl?.hasError('required')).toBeTruthy();
  });

  it('should show password validation error for minlength', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('short');
    passwordControl?.markAsTouched();
    fixture.detectChanges();
    expect(passwordControl?.hasError('minlength')).toBeTruthy();
  });

  it('shows the MFA step when login response requires MFA', () => {
    mockAuthService.login = vi.fn().mockReturnValue(
      of({ accessToken: null, refreshToken: null, mfaRequired: true, mfaToken: 'challenge-abc' })
    );
    component.loginForm.setValue({ email: 'super@example.com', password: 'Password1!' });

    component.onSubmit();

    expect(component.step).toBe('mfa');
    expect(component.mfaToken).toBe('challenge-abc');
  });

  it('navigates by role-based redirect after successful non-MFA login', () => {
    const navSpy = vi.spyOn(router, 'navigateByUrl');
    mockAuthService.login = vi.fn().mockReturnValue(
      of({ accessToken: 'token', refreshToken: null, mfaRequired: false, mfaToken: null })
    );
    mockAuthService.postLoginRedirectPath = vi.fn().mockReturnValue('/admin');
    component.loginForm.setValue({ email: 'owner@example.com', password: 'Password1!' });

    component.onSubmit();

    expect(navSpy).toHaveBeenCalledWith('/admin');
  });

  it('navigates to returnUrl instead of the role-based redirect when present and internal', () => {
    queryParams['returnUrl'] = '/checkout';
    const navSpy = vi.spyOn(router, 'navigateByUrl');
    mockAuthService.login = vi.fn().mockReturnValue(
      of({ accessToken: 'token', refreshToken: null, mfaRequired: false, mfaToken: null })
    );
    mockAuthService.postLoginRedirectPath = vi.fn().mockReturnValue('/products');
    component.loginForm.setValue({ email: 'shopper@example.com', password: 'Password1!' });

    component.onSubmit();

    expect(navSpy).toHaveBeenCalledWith('/checkout');
  });

  it('falls back to the role-based redirect when returnUrl is an external URL (open-redirect guard)', () => {
    queryParams['returnUrl'] = 'https://evil.example.com/phish';
    const navSpy = vi.spyOn(router, 'navigateByUrl');
    mockAuthService.login = vi.fn().mockReturnValue(
      of({ accessToken: 'token', refreshToken: null, mfaRequired: false, mfaToken: null })
    );
    mockAuthService.postLoginRedirectPath = vi.fn().mockReturnValue('/products');
    component.loginForm.setValue({ email: 'shopper@example.com', password: 'Password1!' });

    component.onSubmit();

    expect(navSpy).toHaveBeenCalledWith('/products');
  });

  it('falls back to the role-based redirect when returnUrl is protocol-relative (open-redirect guard)', () => {
    queryParams['returnUrl'] = '//evil.example.com/phish';
    const navSpy = vi.spyOn(router, 'navigateByUrl');
    mockAuthService.login = vi.fn().mockReturnValue(
      of({ accessToken: 'token', refreshToken: null, mfaRequired: false, mfaToken: null })
    );
    mockAuthService.postLoginRedirectPath = vi.fn().mockReturnValue('/products');
    component.loginForm.setValue({ email: 'shopper@example.com', password: 'Password1!' });

    component.onSubmit();

    expect(navSpy).toHaveBeenCalledWith('/products');
  });

  it('submits the MFA code and redirects on success', () => {
    const navSpy = vi.spyOn(router, 'navigateByUrl');
    mockAuthService.loginMfa = vi.fn().mockReturnValue(
      of({ accessToken: 'token', refreshToken: null, mfaRequired: false, mfaToken: null })
    );
    mockAuthService.postLoginRedirectPath = vi.fn().mockReturnValue('/admin/platform');
    component.step = 'mfa';
    component.mfaToken = 'challenge-abc';
    component.mfaCode = '123456';

    component.onSubmitMfa();

    expect(mockAuthService.loginMfa).toHaveBeenCalledWith({ mfaToken: 'challenge-abc', code: '123456' });
    expect(navSpy).toHaveBeenCalledWith('/admin/platform');
  });

  it('honors returnUrl after MFA verification too', () => {
    queryParams['returnUrl'] = '/checkout';
    const navSpy = vi.spyOn(router, 'navigateByUrl');
    mockAuthService.loginMfa = vi.fn().mockReturnValue(
      of({ accessToken: 'token', refreshToken: null, mfaRequired: false, mfaToken: null })
    );
    mockAuthService.postLoginRedirectPath = vi.fn().mockReturnValue('/admin/platform');
    component.step = 'mfa';
    component.mfaToken = 'challenge-abc';
    component.mfaCode = '123456';

    component.onSubmitMfa();

    expect(navSpy).toHaveBeenCalledWith('/checkout');
  });

  it('shows an error and stays on the MFA step for an invalid code', () => {
    mockAuthService.loginMfa = vi.fn().mockReturnValue(throwError(() => new Error('invalid')));
    component.step = 'mfa';
    component.mfaToken = 'challenge-abc';
    component.mfaCode = '000000';

    component.onSubmitMfa();

    expect(component.step).toBe('mfa');
    expect(component.mfaError).toContain('Invalid or expired code');
  });

  it('rejects a code that is not 6 digits without calling the service', () => {
    mockAuthService.loginMfa = vi.fn();
    component.step = 'mfa';
    component.mfaCode = '123';

    component.onSubmitMfa();

    expect(mockAuthService.loginMfa).not.toHaveBeenCalled();
    expect(component.mfaError).toBeTruthy();
  });
});
