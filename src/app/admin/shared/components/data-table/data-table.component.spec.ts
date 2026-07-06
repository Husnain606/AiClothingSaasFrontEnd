import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';

interface Row {
  id: string;
  name: string;
  amount: number;
}

describe('DataTableComponent', () => {
  let fixture: ComponentFixture<DataTableComponent<Row>>;
  let component: DataTableComponent<Row>;

  const rows: Row[] = [
    { id: '1', name: 'Alice', amount: 10 },
    { id: '2', name: 'Bob', amount: 20 },
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [DataTableComponent] }).compileComponents();
    fixture = TestBed.createComponent(DataTableComponent as any);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'amount', header: 'Amount', sortable: true, cellTemplate: 'currency' },
    ]);
    fixture.componentRef.setInput('rows', rows);
    fixture.componentRef.setInput('totalCount', 2);
    fixture.componentRef.setInput('pageNumber', 1);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.componentRef.setInput('sortKey', null);
    fixture.componentRef.setInput('sortDirection', 'asc');
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('emptyMessage', 'No results');
    fixture.detectChanges();
  });

  it('renders one row per data row', () => {
    const trs = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(trs.length).toBe(2);
  });

  it('renders column headers', () => {
    const text = fixture.nativeElement.querySelector('thead').textContent;
    expect(text).toContain('Name');
    expect(text).toContain('Amount');
  });

  it('shows a loading state instead of rows', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="table-loading"]')).toBeTruthy();
  });

  it('shows the empty message when there are no rows and not loading', () => {
    fixture.componentRef.setInput('rows', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No results');
  });

  it('emits sortChange when a sortable header is clicked', () => {
    const spy = vi.spyOn(component.sortChange, 'emit');
    const header: HTMLElement = fixture.nativeElement.querySelector('[data-sort-key="name"]');
    header.click();
    expect(spy).toHaveBeenCalledWith({ key: 'name', direction: 'asc' });
  });

  it('toggles sort direction when the same column is clicked twice', () => {
    const spy = vi.spyOn(component.sortChange, 'emit');
    fixture.componentRef.setInput('sortKey', 'name');
    fixture.componentRef.setInput('sortDirection', 'asc');
    fixture.detectChanges();
    const header: HTMLElement = fixture.nativeElement.querySelector('[data-sort-key="name"]');
    header.click();
    expect(spy).toHaveBeenCalledWith({ key: 'name', direction: 'desc' });
  });

  it('computes total pages and emits pageChange', () => {
    fixture.componentRef.setInput('totalCount', 45);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.detectChanges();
    expect(component.totalPages).toBe(3);

    const spy = vi.spyOn(component.pageChange, 'emit');
    component.goToPage(2);
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('does not emit pageChange for an out-of-range page', () => {
    const spy = vi.spyOn(component.pageChange, 'emit');
    component.goToPage(0);
    component.goToPage(999);
    expect(spy).not.toHaveBeenCalled();
  });

  it('sets aria-sort on the active sorted column header', () => {
    fixture.componentRef.setInput('sortKey', 'name');
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();
    const header: HTMLElement = fixture.nativeElement.querySelector('[data-sort-key="name"]');
    expect(header.getAttribute('aria-sort')).toBe('descending');
  });

  it('sets aria-sort=none on unsorted sortable columns', () => {
    const header: HTMLElement = fixture.nativeElement.querySelector('[data-sort-key="amount"]');
    expect(header.getAttribute('aria-sort')).toBe('none');
  });
});
