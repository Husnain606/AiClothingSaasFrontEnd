import { Component, OnInit } from '@angular/core';
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
  isNavbarOpen = false;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isAuthenticated();
    this.currentUser$ = this.authService.getCurrentUser();
    this.cartItemCount$ = this.cartService.cart$.pipe(
      map(cart => cart.itemCount)
    );
  }

  toggleNavbar(): void {
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  closeNavbar(): void {
    this.isNavbarOpen = false;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeNavbar();
  }

  onNavigate(path: string): void {
    this.router.navigate([path]);
    this.closeNavbar();
  }
}
