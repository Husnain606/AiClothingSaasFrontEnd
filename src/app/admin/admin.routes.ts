import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { adminRoleGuard } from '../features/auth/guards/admin-role.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminRoleGuard],
    children: [
      {
        path: '',
        title: 'Dashboard | FashionSaaS Admin',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'orders',
        title: 'Orders | FashionSaaS Admin',
        loadChildren: () => import('./orders/orders.routes').then((m) => m.ordersRoutes),
      },
      {
        path: 'catalog',
        title: 'Catalog | FashionSaaS Admin',
        loadChildren: () => import('./catalog/catalog.routes').then((m) => m.catalogRoutes),
      },
      {
        path: 'inventory',
        title: 'Inventory | FashionSaaS Admin',
        loadChildren: () => import('./inventory/inventory.routes').then((m) => m.inventoryRoutes),
      },
      {
        path: 'customers',
        title: 'Customers | FashionSaaS Admin',
        loadChildren: () => import('./customers/customers.routes').then((m) => m.customersRoutes),
      },
      {
        path: 'discounts',
        title: 'Discounts | FashionSaaS Admin',
        loadChildren: () => import('./discounts/discounts.routes').then((m) => m.discountsRoutes),
      },
      {
        path: 'reviews',
        title: 'Reviews | FashionSaaS Admin',
        loadChildren: () => import('./reviews/reviews.routes').then((m) => m.reviewsRoutes),
      },
      {
        path: 'reports',
        title: 'Reports | FashionSaaS Admin',
        loadChildren: () => import('./reports/reports.routes').then((m) => m.reportsRoutes),
      },
      {
        path: 'settings',
        title: 'Settings | FashionSaaS Admin',
        loadChildren: () => import('./settings/settings.routes').then((m) => m.settingsRoutes),
      },
      {
        path: 'platform',
        loadChildren: () => import('./platform/platform.routes').then((m) => m.platformRoutes),
      },
    ],
  },
];
