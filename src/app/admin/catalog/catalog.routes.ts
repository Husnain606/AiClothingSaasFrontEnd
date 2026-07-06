import { Routes } from '@angular/router';

export const catalogRoutes: Routes = [
  { path: '', loadComponent: () => import('./product-list/product-list.component').then((m) => m.ProductListComponent) },
  { path: 'categories', loadComponent: () => import('./categories/category-tree.component').then((m) => m.CategoryTreeComponent) },
  { path: 'new', loadComponent: () => import('./product-form/product-form.component').then((m) => m.ProductFormComponent) },
  { path: ':id', loadComponent: () => import('./product-form/product-form.component').then((m) => m.ProductFormComponent) },
];
