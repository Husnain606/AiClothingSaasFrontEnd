import { Routes } from '@angular/router';

export const platformUsersRoutes: Routes = [
  { path: '', loadComponent: () => import('./platform-user-list/platform-user-list.component').then((m) => m.PlatformUserListComponent) },
];
