import { Routes } from '@angular/router';

export const securityRoutes: Routes = [
  { path: '', redirectTo: 'audit-logs', pathMatch: 'full' },
  { path: 'audit-logs', loadComponent: () => import('./audit-logs/audit-logs.component').then((m) => m.AuditLogsComponent) },
  { path: 'login-attempts', loadComponent: () => import('./login-attempts/login-attempts.component').then((m) => m.LoginAttemptsComponent) },
  { path: 'mfa-setup', loadComponent: () => import('./mfa-setup/mfa-setup.component').then((m) => m.MfaSetupComponent) },
  { path: 'bank-account', loadComponent: () => import('./bank-account/platform-bank-account.component').then((m) => m.PlatformBankAccountComponent) },
];
