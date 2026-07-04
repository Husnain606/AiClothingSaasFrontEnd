import { Routes } from '@angular/router';

export const reportsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./reports-placeholder.component').then((m) => m.ReportsPlaceholderComponent),
  },
];
