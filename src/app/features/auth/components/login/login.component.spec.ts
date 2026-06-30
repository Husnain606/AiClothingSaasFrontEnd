import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

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
});
