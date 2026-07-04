import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings-placeholder.component').then((m) => m.SettingsPlaceholderComponent),
  },
];
