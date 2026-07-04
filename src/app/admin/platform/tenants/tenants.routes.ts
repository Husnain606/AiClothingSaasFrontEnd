import { Routes } from '@angular/router';

export const tenantsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tenants-placeholder.component').then((m) => m.TenantsPlaceholderComponent),
  },
];
