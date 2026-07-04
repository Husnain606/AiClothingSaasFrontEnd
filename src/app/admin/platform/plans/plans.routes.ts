import { Routes } from '@angular/router';

export const plansRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./plans-placeholder.component').then((m) => m.PlansPlaceholderComponent),
  },
];
