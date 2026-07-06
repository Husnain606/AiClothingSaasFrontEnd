import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogAdminService } from '../services/catalog-admin.service';
import { CategoryTreeNodeDto } from '../models/catalog-admin.model';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-category-tree',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-tree.component.html',
})
export class CategoryTreeComponent implements OnInit {
  tree: CategoryTreeNodeDto[] = [];
  newCategoryName = '';

  constructor(
    private catalog: CatalogAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.catalog.getCategoryTree().subscribe((tree) => (this.tree = tree));
  }

  onMove(id: string, newParentId: string | null): void {
    this.catalog.moveCategory(id, newParentId).subscribe({
      next: () => {
        this.toast.success('Category moved.');
        this.load();
      },
      error: () => this.toast.error('Failed to move category.'),
    });
  }

  onReorder(orderedIds: string[]): void {
    const items = orderedIds.map((id, index) => ({ id, sortOrder: index }));
    this.catalog.reorderCategories(items).subscribe({
      next: () => {
        this.toast.success('Order updated.');
        this.load();
      },
      error: () => this.toast.error('Failed to reorder categories.'),
    });
  }

  onDelete(id: string): void {
    this.catalog.deleteCategory(id).subscribe({
      next: () => {
        this.toast.success('Category deleted.');
        this.load();
      },
      error: () => this.toast.error('Failed to delete category.'),
    });
  }

  onCreateRoot(): void {
    if (!this.newCategoryName.trim()) return;
    const slug = this.newCategoryName.trim().toLowerCase().replace(/\s+/g, '-');
    this.catalog
      .createCategory({ name: this.newCategoryName, slug, parentCategoryId: null, sortOrder: this.tree.length })
      .subscribe({
        next: () => {
          this.newCategoryName = '';
          this.toast.success('Category created.');
          this.load();
        },
        error: () => this.toast.error('Failed to create category.'),
      });
  }
}
