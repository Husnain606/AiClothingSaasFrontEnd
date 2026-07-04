import { Routes } from '@angular/router';

export const subscriptionsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./subscriptions-placeholder.component').then((m) => m.SubscriptionsPlaceholderComponent),
  },
];
