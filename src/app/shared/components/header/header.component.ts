import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../features/cart/services/cart.service';
import { CurrentUser } from '../../../features/auth/models/auth.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isLoggedIn$!: Observable<boolean>;
  currentUser$!: Observable<CurrentUser | null>;
  cartItemCount$!: Observable<number>;
  showDashboardLink$!: Observable<boolean>;
  isNavbarOpen = false;
  isUserMenuOpen = false;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isAuthenticated();
    this.currentUser$ = this.authService.getCurrentUser();
    this.cartItemCount$ = this.cartService.cart$.pipe(
      map(cart => cart.itemCount)
    );
    this.showDashboardLink$ = this.currentUser$.pipe(
      map((user) => !!user && (this.authService.isTenantAdmin() || this.authService.isSuperAdmin()))
    );
  }

  toggleNavbar(): void {
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  closeNavbar(): void {
    this.isNavbarOpen = false;
    this.isUserMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.isUserMenuOpen &&
      !this.elementRef.nativeElement.contains(event.target as Node)
    ) {
      this.isUserMenuOpen = false;
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeNavbar();
  }
}
