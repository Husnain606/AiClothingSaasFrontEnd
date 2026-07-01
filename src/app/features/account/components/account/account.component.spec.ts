import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountComponent } from './account.component';
import { AccountService } from '../../services/account.service';
import { AccountStateService } from '../../services/account-state.service';
import { of, throwError } from 'rxjs';
import { CustomerProfile } from '../../models/account.model';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;
  let mockAccountService: Partial<AccountService>;
  let mockStateService: Partial<AccountStateService>;

  const mockProfile: CustomerProfile = {
    userId: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
    createdDate: new Date(),
    lastModifiedDate: new Date(),
  };

  beforeEach(async () => {
    mockAccountService = {
      getProfile: vi.fn().mockReturnValue(of(mockProfile)),
    };

    mockStateService = {
      setProfile: vi.fn(),
      profile$: of(mockProfile),
    };

    await TestBed.configureTestingModule({
      imports: [AccountComponent],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: AccountStateService, useValue: mockStateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with profile tab active', () => {
      expect(component.currentTab).toBe('profile');
    });

    it('should initialize with loading state', () => {
      expect(component.isLoading).toBe(true);
    });

    it('should initialize with no error', () => {
      expect(component.hasError).toBe(false);
      expect(component.errorMessage).toBe('');
    });
  });

  describe('ngOnInit', () => {
    it('should call loadProfile on init', () => {
      const spy = vi.spyOn(component as any, 'loadProfile');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });

    it('should set profile$ observable from state service', () => {
      component.ngOnInit();
      fixture.detectChanges();

      expect(component.profile$).toBeDefined();
    });

    it('should fetch profile from account service', () => {
      component.ngOnInit();
      expect(mockAccountService.getProfile).toHaveBeenCalled();
    });

    it('should set profile in state service on successful load', () => { return new Promise<void>((resolve) => {
      component.ngOnInit();
      fixture.detectChanges();

      setTimeout(() => {
        expect(mockStateService.setProfile).toHaveBeenCalledWith(mockProfile);
        resolve();
      }, 100);
    }); });

    it('should set loading to false on successful profile load', () => { return new Promise<void>((resolve) => {
      component.ngOnInit();
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        resolve();
      }, 100);
    }); });
  });

  describe('Profile Loading', () => {
    it('should set loading state to true when loading profile', () => {
      component['loadProfile']();
      expect(component.isLoading).toBe(true);
    });

    it('should clear error state when loading profile', () => {
      component.hasError = true;
      component.errorMessage = 'Previous error';

      component['loadProfile']();
      expect(component.hasError).toBe(false);
    });

    it('should handle profile load error', () => { return new Promise<void>((resolve) => {
      mockAccountService.getProfile = vi
        .fn()
        .mockReturnValue(throwError(() => new Error('Network error')));

      component['loadProfile']();
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.hasError).toBe(true);
        expect(component.errorMessage).toBe('Failed to load profile. Please try again later.');
        expect(component.isLoading).toBe(false);
        resolve();
      }, 100);
    }); });

    it('should set error message on 401 unauthorized error', () => { return new Promise<void>((resolve) => {
      mockAccountService.getProfile = vi.fn().mockReturnValue(
        throwError(() => ({
          status: 401,
          message: 'Unauthorized',
        }))
      );

      component['loadProfile']();
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.hasError).toBe(true);
        resolve();
      }, 100);
    }); });

    it('should set loading to false on error', () => { return new Promise<void>((resolve) => {
      mockAccountService.getProfile = vi
        .fn()
        .mockReturnValue(throwError(() => new Error('Network error')));

      component['loadProfile']();
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        resolve();
      }, 100);
    }); });
  });

  describe('Tab Navigation', () => {
    it('should change tab to orders', () => {
      component.onTabChange('orders');
      expect(component.currentTab).toBe('orders');
    });

    it('should change tab to wishlist', () => {
      component.onTabChange('wishlist');
      expect(component.currentTab).toBe('wishlist');
    });

    it('should change tab back to profile', () => {
      component.currentTab = 'orders';
      component.onTabChange('profile');
      expect(component.currentTab).toBe('profile');
    });

    it('should cast tab string to correct type', () => {
      component.onTabChange('orders');
      expect(typeof component.currentTab).toBe('string');
      expect(['profile', 'orders', 'wishlist']).toContain(component.currentTab);
    });

    it('should handle invalid tab names gracefully', () => {
      component.onTabChange('invalid' as any);
      expect(component.currentTab).toBe('invalid');
    });

    it('should maintain tab state after navigation', () => {
      component.onTabChange('orders');
      const tab1 = component.currentTab;
      component.onTabChange('wishlist');
      expect(component.currentTab).not.toBe(tab1);
    });
  });

  describe('Component Cleanup', () => {
    it('should unsubscribe from observables on destroy', () => {
      const destroySpy = vi.spyOn(component['destroy$'], 'next');
      component.ngOnDestroy();
      expect(destroySpy).toHaveBeenCalled();
    });

    it('should complete destroy subject on destroy', () => {
      const completeSpy = vi.spyOn(component['destroy$'], 'complete');
      component.ngOnDestroy();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Observable Integration', () => {
    it('should have profile$ observable', () => {
      component.ngOnInit();
      expect(component.profile$).toBeDefined();
    });

    it('should emit profile values through profile$ observable', () => { return new Promise<void>((resolve) => {
      component.ngOnInit();

      component.profile$.subscribe((profile) => {
        if (profile !== null) {
          expect(profile.userId).toBe('123');
          resolve();
        }
      });
    }); });

    it('should use takeUntil to unsubscribe on destroy', () => {
      component.ngOnInit();
      component.ngOnDestroy();
      expect(component['destroy$'].closed).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should log error when profile load fails', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAccountService.getProfile = vi
        .fn()
        .mockReturnValue(throwError(() => new Error('API error')));

      component['loadProfile']();
      fixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should display user-friendly error message on failure', () => { return new Promise<void>((resolve) => {
      mockAccountService.getProfile = vi
        .fn()
        .mockReturnValue(throwError(() => new Error('API error')));

      component['loadProfile']();
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.errorMessage).toContain('Failed to load profile');
        resolve();
      }, 100);
    }); });
  });

  describe('State Management', () => {
    it('should maintain current tab during profile refresh', () => {
      component.ngOnInit();
      component.onTabChange('orders');
      const selectedTab = component.currentTab;

      component['loadProfile']();
      expect(component.currentTab).toBe(selectedTab);
    });

    it('should reset loading state properly', () => { return new Promise<void>((resolve) => {
      component['loadProfile']();
      expect(component.isLoading).toBe(true);

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        resolve();
      }, 100);
    }); });
  });
});
