import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogAdminService } from '../services/catalog-admin.service';
import { ProductVariantDto, CreateVariantRequest } from '../models/catalog-admin.model';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-variant-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './variant-table.component.html',
})
export class VariantTableComponent implements OnChanges {
  @Input({ required: true }) productId!: string;
  variants: ProductVariantDto[] = [];
  newVariant: Omit<CreateVariantRequest, 'productId'> = { sku: '', size: '', color: '', stockQuantity: 0 };

  constructor(
    private catalog: CatalogAdminService,
    private toast: ToastService
  ) {}

  ngOnChanges(): void {
    if (this.productId) this.load();
  }

  private load(): void {
    this.catalog.getVariants(this.productId).subscribe((variants) => (this.variants = variants));
  }

  onAdd(): void {
    this.catalog.addVariant({ productId: this.productId, ...this.newVariant }).subscribe({
      next: () => {
        this.toast.success('Variant added.');
        this.newVariant = { sku: '', size: '', color: '', stockQuantity: 0 };
        this.load();
      },
      error: () => this.toast.error('Failed to add variant.'),
    });
  }

  onDeactivate(variant: ProductVariantDto): void {
    this.catalog.deactivateVariant(variant.id).subscribe({
      next: () => {
        this.toast.success('Variant deactivated.');
        this.load();
      },
      error: () => this.toast.error('Failed to deactivate variant.'),
    });
  }

  onDelete(variant: ProductVariantDto): void {
    this.catalog.deleteVariant(variant.id).subscribe({
      next: () => {
        this.toast.success('Variant deleted.');
        this.load();
      },
      error: () => this.toast.error('Failed to delete variant.'),
    });
  }
}
