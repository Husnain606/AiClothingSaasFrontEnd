import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AdminMenuItem, TENANT_MENU, PLATFORM_MENU, visibleMenuItems } from './menu-config';
import { ToastContainerComponent } from '../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastContainerComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit {
  menuItems: AdminMenuItem[] = [];
  isPlatform = false;
  isDrawerOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isPlatform = this.authService.isSuperAdmin();
    const roles = this.authService.getRoles();
    this.menuItems = visibleMenuItems(this.isPlatform ? PLATFORM_MENU : TENANT_MENU, roles);
  }

  toggleDrawer(): void {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
