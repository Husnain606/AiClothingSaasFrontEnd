import { Routes } from '@angular/router';
import { adminOwnerGuard } from './settings-guard/admin-owner.guard';

export const settingsRoutes: Routes = [
  {
    path: '',
    canActivate: [adminOwnerGuard],
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () => import('./profile/tenant-profile.component').then((m) => m.TenantProfileComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./users/tenant-users.component').then((m) => m.TenantUsersComponent),
      },
      {
        path: 'subscription',
        loadComponent: () =>
          import('./subscription/tenant-subscription.component').then((m) => m.TenantSubscriptionComponent),
      },
      {
        path: 'bank-account',
        loadComponent: () =>
          import('./bank-account/tenant-bank-account.component').then((m) => m.TenantBankAccountComponent),
      },
    ],
  },
];
