import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { CustomerListComponent } from './customer-list.component';
import { CustomerAdminService } from '../services/customer-admin.service';

describe('CustomerListComponent', () => {
  let fixture: ComponentFixture<CustomerListComponent>;
  let component: CustomerListComponent;
  let mockCustomers: Partial<CustomerAdminService>;

  const customer1 = { id: 'c1', email: 'a@b.com', firstName: 'A', lastName: 'B', isActive: true, createdAt: '2026-01-01' };
  const customer2 = { id: 'c2', email: 'x@y.com', firstName: 'X', lastName: 'Y', isActive: false, createdAt: '2026-01-02' };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockCustomers = {
      getCustomers: vi
        .fn()
        .mockReturnValue(of({ items: [customer1, customer2], totalCount: 2, page: 1, pageSize: 20, totalPages: 1 })),
    };

    await TestBed.configureTestingModule({
      imports: [CustomerListComponent],
      providers: [provideRouter([{ path: 'admin/customers/:id', children: [] }]), { provide: CustomerAdminService, useValue: mockCustomers }],
    }).compileComponents();
    fixture = TestBed.createComponent(CustomerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads customers on init', () => {
    expect(component.rows.length).toBe(2);
  });

  it('renders exactly one table row per customer (no duplicate rendering)', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(component.rows.length);
  });

  it('renders each customer email exactly once in the DOM', () => {
    const text = fixture.nativeElement.textContent as string;
    for (const c of [customer1, customer2]) {
      const occurrences = text.split(c.email).length - 1;
      expect(occurrences).toBe(1);
    }
  });

  it('searches customers', () => {
    (mockCustomers.getCustomers as ReturnType<typeof vi.fn>).mockClear();
    component.onSearchChange('a@b.com');
    expect(mockCustomers.getCustomers).toHaveBeenCalledWith(1, 20, 'a@b.com');
  });

  it('paginates', () => {
    (mockCustomers.getCustomers as ReturnType<typeof vi.fn>).mockClear();
    component.onPageChange(2);
    expect(mockCustomers.getCustomers).toHaveBeenCalledWith(2, 20, undefined);
  });
});
