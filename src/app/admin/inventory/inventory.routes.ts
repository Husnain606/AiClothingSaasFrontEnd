import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./low-stock/low-stock.component').then((m) => m.LowStockComponent),
  },
];
