import { Routes } from '@angular/router';

export const plansRoutes: Routes = [
  { path: '', loadComponent: () => import('./plan-list/plan-list.component').then((m) => m.PlanListComponent) },
];
