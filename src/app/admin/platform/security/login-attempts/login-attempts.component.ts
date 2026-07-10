import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { LoginAttemptDto } from '../../models/platform.model';

@Component({
  selector: 'app-login-attempts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-attempts.component.html',
})
export class LoginAttemptsComponent implements OnInit {
  attempts: LoginAttemptDto[] = [];
  emailFilter = '';

  constructor(private platform: PlatformAdminService) {}

  ngOnInit(): void {
    this.load();
  }

  onEmailFilterChange(email: string): void {
    this.emailFilter = email;
    this.load();
  }

  private load(): void {
    const filter = this.emailFilter ? { email: this.emailFilter } : {};
    this.platform.getLoginAttempts(filter).subscribe((attempts) => (this.attempts = attempts));
  }
}
