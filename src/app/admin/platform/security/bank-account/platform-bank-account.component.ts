import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { PlatformBankAccountDto } from '../../models/platform.model';

@Component({
  selector: 'app-platform-bank-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './platform-bank-account.component.html',
})
export class PlatformBankAccountComponent implements OnInit {
  account: PlatformBankAccountDto | null = null;

  constructor(private platform: PlatformAdminService) {}

  ngOnInit(): void {
    this.platform.getPlatformBankAccount().subscribe((account) => (this.account = account));
  }
}
