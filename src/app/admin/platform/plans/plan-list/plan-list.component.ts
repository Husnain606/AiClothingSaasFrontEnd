import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { SubscriptionPlanDto, CreatePlanRequest } from '../../models/platform.model';
import { ToastService } from '../../../shared/services/toast.service';

const DEFAULT_NEW_PLAN: CreatePlanRequest = {
  planType: 'Monthly',
  name: '',
  price: 0,
  durationDays: 30,
  trialDays: 0,
  productLimit: 0,
  userLimit: 0,
  aiUsageLimit: 0,
  storageLimitMb: 0,
};

@Component({
  selector: 'app-plan-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-list.component.html',
})
export class PlanListComponent implements OnInit {
  plans: SubscriptionPlanDto[] = [];
  newPlan: CreatePlanRequest = { ...DEFAULT_NEW_PLAN };

  constructor(
    private platform: PlatformAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.platform.getPlans().subscribe((plans) => (this.plans = plans));
  }

  onCreate(): void {
    this.platform.createPlan(this.newPlan).subscribe({
      next: () => {
        this.toast.success('Plan created.');
        this.newPlan = { ...DEFAULT_NEW_PLAN };
        this.load();
      },
      error: () => this.toast.error('Failed to create plan.'),
    });
  }

  onDelete(plan: SubscriptionPlanDto): void {
    this.platform.deletePlan(plan.id).subscribe({
      next: () => {
        this.toast.success('Plan deleted.');
        this.load();
      },
      error: () => this.toast.error('Failed to delete plan.'),
    });
  }
}
