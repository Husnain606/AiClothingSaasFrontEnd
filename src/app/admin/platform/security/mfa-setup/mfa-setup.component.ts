import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mfa-setup.component.html',
})
export class MfaSetupComponent implements OnInit {
  qrCodeUrl = '';
  secretBase32 = '';
  verificationCode = '';
  verified = false;

  constructor(
    private platform: PlatformAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.platform.setupMfa().subscribe((response) => {
      this.qrCodeUrl = response.qrCodeUrl;
      this.secretBase32 = response.secretBase32;
    });
  }

  onVerify(): void {
    this.platform.verifyMfaSetup(this.verificationCode).subscribe({
      next: () => {
        this.verified = true;
        this.toast.success('MFA enabled.');
      },
      error: () => {
        this.verified = false;
        this.toast.error('Invalid verification code.');
      },
    });
  }
}
