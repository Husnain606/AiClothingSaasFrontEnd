import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { PlatformSubscriptionDto, SubscriptionPlanDto } from '../../models/platform.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription-list.component.html',
})
export class SubscriptionListComponent implements OnInit {
  subscriptions: PlatformSubscriptionDto[] = [];
  plans: SubscriptionPlanDto[] = [];

  constructor(
    private platform: PlatformAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.platform.getSubscriptions().subscribe((subs) => (this.subscriptions = subs));
    this.platform.getPlans().subscribe((plans) => (this.plans = plans));
  }

  onChangePlan(sub: PlatformSubscriptionDto, planId: string): void {
    this.platform.changeSubscriptionPlan(sub.id, planId).subscribe({
      next: () => {
        this.toast.success('Plan changed.');
        this.reload();
      },
      error: () => this.toast.error('Failed to change plan.'),
    });
  }

  onSuspend(sub: PlatformSubscriptionDto): void {
    this.platform.suspendSubscription(sub.id).subscribe({
      next: () => {
        this.toast.success('Subscription suspended.');
        this.reload();
      },
      error: () => this.toast.error('Failed to suspend subscription.'),
    });
  }

  onReactivate(sub: PlatformSubscriptionDto): void {
    this.platform.reactivateSubscription(sub.id).subscribe({
      next: () => {
        this.toast.success('Subscription reactivated.');
        this.reload();
      },
      error: () => this.toast.error('Failed to reactivate subscription.'),
    });
  }

  private reload(): void {
    this.platform.getSubscriptions().subscribe((subs) => (this.subscriptions = subs));
  }
}
