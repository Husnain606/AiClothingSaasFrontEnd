import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { PlatformUserDto } from '../../models/platform.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-platform-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './platform-user-list.component.html',
})
export class PlatformUserListComponent implements OnInit {
  users: PlatformUserDto[] = [];

  constructor(
    private platform: PlatformAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  onUnlock(user: PlatformUserDto): void {
    this.platform.unlockPlatformUser(user.id).subscribe({
      next: () => {
        this.toast.success('User unlocked.');
        this.load();
      },
      error: () => this.toast.error('Failed to unlock user.'),
    });
  }

  private load(): void {
    this.platform.getPlatformUsers().subscribe((users) => (this.users = users));
  }
}
