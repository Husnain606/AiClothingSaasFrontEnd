import { Routes } from '@angular/router';
import { superAdminGuard } from '../../features/auth/guards/super-admin.guard';

export const platformRoutes: Routes = [
  {
    path: '',
    canActivate: [superAdminGuard],
    children: [
      {
        path: '',
        title: 'Platform Home | FashionSaaS',
        loadComponent: () => import('./home/platform-home.component').then((m) => m.PlatformHomeComponent),
      },
      {
        path: 'tenants',
        title: 'Tenants | FashionSaaS',
        loadChildren: () => import('./tenants/tenants.routes').then((m) => m.tenantsRoutes),
      },
      {
        path: 'plans',
        title: 'Plans | FashionSaaS',
        loadChildren: () => import('./plans/plans.routes').then((m) => m.plansRoutes),
      },
      {
        path: 'subscriptions',
        title: 'Subscriptions | FashionSaaS',
        loadChildren: () => import('./subscriptions/subscriptions.routes').then((m) => m.subscriptionsRoutes),
      },
      {
        path: 'payments',
        title: 'Payments | FashionSaaS',
        loadChildren: () => import('./payments/payments.routes').then((m) => m.paymentsRoutes),
      },
      {
        path: 'users',
        title: 'Platform Users | FashionSaaS',
        loadChildren: () => import('./users/platform-users.routes').then((m) => m.platformUsersRoutes),
      },
      {
        path: 'security',
        title: 'Security | FashionSaaS',
        loadChildren: () => import('./security/security.routes').then((m) => m.securityRoutes),
      },
    ],
  },
];
