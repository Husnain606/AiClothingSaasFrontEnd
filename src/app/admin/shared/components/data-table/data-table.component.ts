import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DataTableColumn<T> {
  key: keyof T & string;
  header: string;
  sortable?: boolean;
  cellTemplate?: 'text' | 'currency' | 'date' | 'custom';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent<T extends object> {
  @Input({ required: true }) columns!: DataTableColumn<T>[];
  @Input({ required: true }) rows!: T[];
  @Input() totalCount = 0;
  @Input() pageNumber = 1;
  @Input() pageSize = 20;
  @Input() sortKey: string | null = null;
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() loading = false;
  @Input() emptyMessage = 'No results found.';

  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ key: string; direction: 'asc' | 'desc' }>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  cellValue(row: T, column: DataTableColumn<T>): unknown {
    return (row as Record<string, unknown>)[column.key];
  }

  cellText(row: T, column: DataTableColumn<T>): string | number {
    const value = this.cellValue(row, column);
    return value as string | number;
  }

  cellDate(row: T, column: DataTableColumn<T>): string | number | Date {
    const value = this.cellValue(row, column);
    return value as string | number | Date;
  }

  onSort(column: DataTableColumn<T>): void {
    if (!column.sortable) return;
    const direction: 'asc' | 'desc' =
      this.sortKey === column.key && this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ key: column.key, direction });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageChange.emit(page);
  }
}
