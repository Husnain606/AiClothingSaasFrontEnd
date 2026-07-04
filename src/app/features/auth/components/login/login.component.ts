import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest, LoginMfaRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  step: 'credentials' | 'mfa' = 'credentials';
  mfaToken = '';
  mfaCode = '';
  mfaError = '';
  mfaSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginRequest: LoginRequest = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
    };

    this.authService
      .login(loginRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.mfaRequired && response.mfaToken) {
            this.step = 'mfa';
            this.mfaToken = response.mfaToken;
            return;
          }
          this.router.navigateByUrl(this.authService.postLoginRedirectPath());
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage =
            error.error?.message || 'Login failed. Please try again.';
        },
      });
  }

  onSubmitMfa(): void {
    if (!this.mfaCode || this.mfaCode.length !== 6) {
      this.mfaError = 'Enter the 6-digit code from your authenticator app.';
      return;
    }
    this.mfaSubmitting = true;
    this.mfaError = '';

    const request: LoginMfaRequest = { mfaToken: this.mfaToken, code: this.mfaCode };
    this.authService
      .loginMfa(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.mfaSubmitting = false;
          this.router.navigateByUrl(this.authService.postLoginRedirectPath());
        },
        error: () => {
          this.mfaSubmitting = false;
          this.mfaError = 'Invalid or expired code. Try again.';
        },
      });
  }

  onBackToCredentials(): void {
    this.step = 'credentials';
    this.mfaCode = '';
    this.mfaError = '';
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
