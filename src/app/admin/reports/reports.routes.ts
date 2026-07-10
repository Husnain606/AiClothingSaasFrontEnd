import { Routes } from '@angular/router';
import { ReportPageComponent } from './report-page/report-page.component';

export const reportsRoutes: Routes = [
  { path: '', redirectTo: 'summary', pathMatch: 'full' },
  { path: 'summary', component: ReportPageComponent, data: { reportKey: 'summary', title: 'Summary' } },
  {
    path: 'sales-over-time',
    component: ReportPageComponent,
    data: { reportKey: 'sales-over-time', title: 'Sales over time' },
  },
  {
    path: 'top-products',
    component: ReportPageComponent,
    data: { reportKey: 'top-products', title: 'Top products' },
  },
  {
    path: 'order-status-breakdown',
    component: ReportPageComponent,
    data: { reportKey: 'order-status-breakdown', title: 'Order status breakdown' },
  },
  {
    path: 'customer-analytics',
    component: ReportPageComponent,
    data: { reportKey: 'customer-analytics', title: 'Customer analytics' },
  },
  {
    path: 'inventory-trends',
    component: ReportPageComponent,
    data: { reportKey: 'inventory-trends', title: 'Inventory trends' },
  },
  {
    path: 'category-sales',
    component: ReportPageComponent,
    data: { reportKey: 'category-sales', title: 'Category sales' },
  },
];
