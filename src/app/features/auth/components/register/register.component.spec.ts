import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: Partial<AuthService>;
  let mockRouter: Partial<Router>;

  beforeEach(async () => {
    mockAuthService = { register: vi.fn() };
    mockRouter = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize register form with all required controls', () => {
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('firstName')).toBeDefined();
    expect(component.registerForm.get('lastName')).toBeDefined();
    expect(component.registerForm.get('email')).toBeDefined();
    expect(component.registerForm.get('password')).toBeDefined();
    expect(component.registerForm.get('confirmPassword')).toBeDefined();
  });

  it('should have invalid form initially', () => {
    expect(component.registerForm.invalid).toBeTruthy();
  });

  it('should validate password and confirmPassword match', () => {
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password456',
    });
    expect(component.registerForm.hasError('passwordMismatch')).toBeTruthy();
  });

  it('should be valid when all fields match and are properly filled', () => {
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(component.registerForm.valid).toBeTruthy();
  });

  it('should show firstName validation error for minlength', () => {
    const firstNameControl = component.registerForm.get('firstName');
    firstNameControl?.setValue('J');
    firstNameControl?.markAsTouched();
    fixture.detectChanges();
    expect(firstNameControl?.hasError('minlength')).toBeTruthy();
  });

  it('should show email validation error for invalid format', () => {
    const emailControl = component.registerForm.get('email');
    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();
    fixture.detectChanges();
    expect(emailControl?.hasError('email')).toBeTruthy();
  });
});
