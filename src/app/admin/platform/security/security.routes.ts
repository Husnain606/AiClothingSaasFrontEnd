import { Routes } from '@angular/router';

export const securityRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./security-placeholder.component').then((m) => m.SecurityPlaceholderComponent),
  },
];
