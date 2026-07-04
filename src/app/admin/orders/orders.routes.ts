import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./orders-placeholder.component').then((m) => m.OrdersPlaceholderComponent),
  },
];
