import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [SearchBarComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty search term', () => {
    expect(component.searchTerm).toBe('');
  });

  it('should emit search with debounce on input', () => {
    vi.useFakeTimers();
    vi.spyOn(component.search, 'emit');
    component.searchTerm = 'test';
    component.onSearch();
    expect(component.search.emit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(component.search.emit).toHaveBeenCalledWith('test');
  });

  it('should clear search term on onClear', () => {
    component.searchTerm = 'test';
    component.onClear();
    expect(component.searchTerm).toBe('');
  });

  it('should emit empty string on clear', () => {
    vi.useFakeTimers();
    vi.spyOn(component.search, 'emit');
    component.searchTerm = 'test';
    component.onClear();
    vi.advanceTimersByTime(300);
    expect(component.search.emit).toHaveBeenCalledWith('');
  });

  it('should show clear button when search term exists', () => {
    component.searchTerm = 'test';
    fixture.componentRef.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const clearBtn = fixture.nativeElement.querySelector('.btn-outline-secondary');
    expect(clearBtn).toBeTruthy();
  });

  it('should hide clear button when search term is empty', () => {
    component.searchTerm = '';
    fixture.componentRef.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const clearBtn = fixture.nativeElement.querySelector('.btn-outline-secondary');
    expect(clearBtn).toBeFalsy();
  });

  it('should emit search on Enter key press', () => {
    vi.useFakeTimers();
    vi.spyOn(component.search, 'emit');
    component.searchTerm = 'test';
    const event = new KeyboardEvent('keypress', { key: 'Enter' });
    component.onKeyPress(event);
    expect(component.search.emit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(component.search.emit).toHaveBeenCalled();
  });

  it('should not emit on other key press', () => {
    vi.useFakeTimers();
    vi.spyOn(component.search, 'emit');
    component.searchTerm = 'test';
    const event = new KeyboardEvent('keypress', { key: 'A' });
    component.onKeyPress(event);
    vi.advanceTimersByTime(300);
    expect(component.search.emit).not.toHaveBeenCalled();
  });

  it('should focus input on clear', () => {
    component.searchInput = { nativeElement: { focus: vi.fn() } };
    component.searchTerm = 'test';
    component.onClear();
    expect(component.searchInput.nativeElement.focus).toHaveBeenCalled();
  });

  it('should complete search subject on destroy', () => {
    vi.spyOn(component['searchSubject'], 'complete');
    component.ngOnDestroy();
    expect(component['searchSubject'].complete).toHaveBeenCalled();
  });
});
