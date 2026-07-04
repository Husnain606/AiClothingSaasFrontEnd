import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { TENANT_ADMIN_ROLES } from '../models/auth.model';

export const adminRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    take(1),
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
      if (!authService.hasAnyRole([...TENANT_ADMIN_ROLES, 'SuperAdmin'])) {
        router.navigate(['/products']);
        return false;
      }
      return true;
    })
  );
};
