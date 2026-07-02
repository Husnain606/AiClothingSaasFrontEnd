import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Route, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { authGuard } from './features/auth/guards/auth.guard';
import { cartNotEmptyGuard } from './features/cart/guards/cart-not-empty.guard';

const mainLayoutRoute = routes.find(r => r.component === MainLayoutComponent)!;
const authLayoutRoute = routes.find(r => r.component === AuthLayoutComponent)!;

const findChild = (parent: Route, path: string): Route =>
  parent.children!.find(c => c.path === path)!;

describe('app routes configuration', () => {
  it('should mount the main layout at the root path', () => {
    expect(mainLayoutRoute).toBeDefined();
    expect(mainLayoutRoute.path).toBe('');
    expect(mainLayoutRoute.children!.length).toBeGreaterThan(0);
  });

  it('should mount the auth layout at the root path with login and register children', () => {
    expect(authLayoutRoute).toBeDefined();
    expect(authLayoutRoute.path).toBe('');
    expect(authLayoutRoute.children!.map(c => c.path)).toEqual(['login', 'register']);
  });

  it('should redirect the empty path to products', () => {
    const redirect = findChild(mainLayoutRoute, '');
    expect(redirect.redirectTo).toBe('products');
    expect(redirect.pathMatch).toBe('full');
  });

  it('should guard products, cart, and account with authGuard', () => {
    for (const path of ['products', 'products/:id', 'cart', 'account']) {
      const route = findChild(mainLayoutRoute, path);
      expect(route.canActivate).toContain(authGuard);
    }
  });

  it('should guard checkout with both authGuard and cartNotEmptyGuard', () => {
    const checkout = findChild(mainLayoutRoute, 'checkout');
    expect(checkout.canActivate).toEqual([authGuard, cartNotEmptyGuard]);
  });

  it('should not guard login and register', () => {
    for (const path of ['login', 'register']) {
      const route = findChild(authLayoutRoute, path);
      expect(route.canActivate).toBeUndefined();
    }
  });

  it('should lazily load every feature route', () => {
    const lazyPaths = ['products', 'products/:id', 'cart', 'checkout', 'account'];
    for (const path of lazyPaths) {
      const route = findChild(mainLayoutRoute, path);
      expect(route.component).toBeUndefined();
      expect(typeof route.loadComponent).toBe('function');
    }
    for (const path of ['login', 'register']) {
      const route = findChild(authLayoutRoute, path);
      expect(route.component).toBeUndefined();
      expect(typeof route.loadComponent).toBe('function');
    }
  });

  it('should resolve every lazy loadComponent to a component class', async () => {
    const lazyRoutes = [
      ...mainLayoutRoute.children!.filter(c => c.loadComponent),
      ...authLayoutRoute.children!.filter(c => c.loadComponent),
    ];
    expect(lazyRoutes.length).toBe(7);
    for (const route of lazyRoutes) {
      const component = await route.loadComponent!();
      expect(component).toBeDefined();
      expect(typeof component).toBe('function');
    }
  });

  it('should define a page title on every navigable route', () => {
    const navigable = [
      ...mainLayoutRoute.children!.filter(c => c.path !== ''),
      ...authLayoutRoute.children!,
      routes.find(r => r.path === '**')!,
    ];
    for (const route of navigable) {
      expect(route.title, `route "${route.path}" is missing a title`).toBeTruthy();
      expect(String(route.title)).toContain('FashionSaaS');
    }
  });

  it('should route unknown paths to the NotFoundComponent via wildcard', () => {
    const wildcard = routes.find(r => r.path === '**')!;
    expect(wildcard).toBeDefined();
    expect(wildcard.component).toBe(NotFoundComponent);
    expect(routes.indexOf(wildcard)).toBe(routes.length - 1);
  });
});

describe('app routes navigation', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();

    // Only the wildcard route is exercised here; it has no guards or
    // service dependencies, so no feature mocks are required.
    const navRoutes: Routes = [routes.find(r => r.path === '**')!];
    TestBed.configureTestingModule({
      providers: [provideRouter(navRoutes)],
    });
  });

  it('should render NotFoundComponent for an unknown URL', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/definitely/not/a/page');
    expect(component).toBeInstanceOf(NotFoundComponent);
  });
});
