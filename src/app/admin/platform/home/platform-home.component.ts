import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PlatformAdminService } from '../services/platform-admin.service';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-platform-home',
  standalone: true,
  imports: [CommonModule, KpiCardComponent],
  templateUrl: './platform-home.component.html',
})
export class PlatformHomeComponent implements OnInit {
  tenantCount = 0;
  activeSubscriptionCount = 0;
  platformUserCount = 0;

  constructor(private platform: PlatformAdminService) {}

  ngOnInit(): void {
    forkJoin({
      tenants: this.platform.getTenants(1, 1),
      subscriptions: this.platform.getSubscriptions(),
      users: this.platform.getPlatformUsers(),
    }).subscribe(({ tenants, subscriptions, users }) => {
      this.tenantCount = tenants.totalCount;
      this.activeSubscriptionCount = subscriptions.filter((s) => s.status === 'Active').length;
      this.platformUserCount = users.length;
    });
  }
}
