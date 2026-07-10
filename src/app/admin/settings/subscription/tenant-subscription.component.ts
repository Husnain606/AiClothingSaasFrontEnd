import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsAdminService } from '../services/settings-admin.service';
import { TenantSubscriptionDto, TenantPaymentDto } from '../models/settings-admin.model';

@Component({
  selector: 'app-tenant-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-subscription.component.html',
})
export class TenantSubscriptionComponent implements OnInit {
  subscription: TenantSubscriptionDto | null = null;
  payments: TenantPaymentDto[] = [];

  constructor(private settings: SettingsAdminService) {}

  ngOnInit(): void {
    this.settings.getSubscription().subscribe((s) => (this.subscription = s));
    this.settings.getPayments().subscribe((p) => (this.payments = p));
  }
}
