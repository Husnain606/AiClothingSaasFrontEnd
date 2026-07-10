import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsAdminService } from '../services/settings-admin.service';
import { BankAccountDto } from '../models/settings-admin.model';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-tenant-bank-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-bank-account.component.html',
})
export class TenantBankAccountComponent implements OnInit {
  masked: BankAccountDto | null = null;
  full: BankAccountDto | null = null;
  totpCode = '';

  constructor(
    private settings: SettingsAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.settings.getBankAccount().subscribe((account) => (this.masked = account));
  }

  onReveal(): void {
    this.settings.getBankAccountFull(this.totpCode).subscribe({
      next: (full) => {
        this.full = full;
        this.totpCode = '';
      },
      error: () => this.toast.error('Invalid or expired verification code.'),
    });
  }
}
