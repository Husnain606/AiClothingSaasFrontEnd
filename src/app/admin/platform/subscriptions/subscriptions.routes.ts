import { Routes } from '@angular/router';

export const subscriptionsRoutes: Routes = [
  { path: '', loadComponent: () => import('./subscription-list/subscription-list.component').then((m) => m.SubscriptionListComponent) },
];
