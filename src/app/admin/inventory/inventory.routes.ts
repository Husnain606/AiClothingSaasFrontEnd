import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./inventory-placeholder.component').then((m) => m.InventoryPlaceholderComponent),
  },
];
