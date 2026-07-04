import { Routes } from '@angular/router';

export const reviewsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./reviews-placeholder.component').then((m) => m.ReviewsPlaceholderComponent),
  },
];
