import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { TenantDto } from '../../models/platform.model';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './tenant-detail.component.html',
})
export class TenantDetailComponent implements OnInit {
  tenant: TenantDto | null = null;
  deleteModalOpen = false;
  requireTypedConfirmation = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private platform: PlatformAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.platform.getTenant(id).subscribe((tenant) => {
      this.tenant = tenant;
      this.requireTypedConfirmation = tenant.slug;
    });
  }

  openDeleteModal(): void {
    this.deleteModalOpen = true;
  }

  onDeleteCancelled(): void {
    this.deleteModalOpen = false;
  }

  onDeleteConfirmed(): void {
    if (!this.tenant) return;
    this.platform.deleteTenant(this.tenant.id).subscribe({
      next: () => {
        this.toast.success('Tenant deleted.');
        this.router.navigate(['/admin/platform/tenants']);
      },
      error: () => {
        this.toast.error('Failed to delete tenant.');
        this.deleteModalOpen = false;
      },
    });
  }
}
