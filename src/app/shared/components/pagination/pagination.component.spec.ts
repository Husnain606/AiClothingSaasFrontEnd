import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.currentPage).toBe(1);
    expect(component.totalPages).toBe(1);
    expect(component.pageSize).toBe(10);
  });

  it('should emit pageChange when onPageChange is called with valid page', () => {
    vi.spyOn(component.pageChange, 'emit');
    component.totalPages = 5;
    component.onPageChange(2);
    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });

  it('should not emit pageChange when page is out of bounds', () => {
    vi.spyOn(component.pageChange, 'emit');
    component.totalPages = 5;
    component.onPageChange(0);
    expect(component.pageChange.emit).not.toHaveBeenCalled();
  });

  it('should not emit pageChange when page equals current page', () => {
    vi.spyOn(component.pageChange, 'emit');
    component.currentPage = 2;
    component.totalPages = 5;
    component.onPageChange(2);
    expect(component.pageChange.emit).not.toHaveBeenCalled();
  });

  it('should calculate correct page range', () => {
    component.currentPage = 3;
    component.totalPages = 10;
    const pages = component.pages;
    expect(pages).toContain(1);
    expect(pages).toContain(3);
    expect(pages).toContain(5);
  });

  it('should handle first page correctly', () => {
    component.currentPage = 1;
    component.totalPages = 10;
    const pages = component.pages;
    expect(pages[0]).toBe(1);
  });

  it('should handle last page correctly', () => {
    component.currentPage = 10;
    component.totalPages = 10;
    const pages = component.pages;
    expect(pages[pages.length - 1]).toBe(10);
  });

  it('should disable previous button on first page', () => {
    component.currentPage = 1;
    expect(component.canGoPrevious).toBe(false);
  });

  it('should enable previous button after first page', () => {
    component.currentPage = 2;
    expect(component.canGoPrevious).toBe(true);
  });

  it('should disable next button on last page', () => {
    component.currentPage = 10;
    component.totalPages = 10;
    expect(component.canGoNext).toBe(false);
  });

  it('should enable next button before last page', () => {
    component.currentPage = 5;
    component.totalPages = 10;
    expect(component.canGoNext).toBe(true);
  });
});
