import { Routes } from '@angular/router';

export const platformUsersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./platform-users-placeholder.component').then((m) => m.PlatformUsersPlaceholderComponent),
  },
];
