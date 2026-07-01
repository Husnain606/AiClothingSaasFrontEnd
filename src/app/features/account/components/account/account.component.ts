import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from '../../services/account.service';
import { AccountStateService } from '../../services/account-state.service';
import { CustomerProfile } from '../../models/account.model';
import { ProfileComponent } from '../profile/profile.component';
import { OrderHistoryComponent } from '../order-history/order-history.component';
import { WishlistComponent } from '../wishlist/wishlist.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ProfileComponent, OrderHistoryComponent, WishlistComponent],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit, OnDestroy {
  profile$!: Observable<CustomerProfile | null>;
  currentTab: 'profile' | 'orders' | 'wishlist' = 'profile';
  isLoading = true;
  hasError = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private accountService: AccountService,
    private accountState: AccountStateService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.profile$ = this.accountState.profile$;
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.hasError = false;

    this.accountService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.accountState.setProfile(profile);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load profile:', err);
          this.hasError = true;
          this.errorMessage = 'Failed to load profile. Please try again later.';
          this.isLoading = false;
        },
      });
  }

  onTabChange(tab: string): void {
    this.currentTab = tab as 'profile' | 'orders' | 'wishlist';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
