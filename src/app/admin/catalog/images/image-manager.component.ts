import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogAdminService } from '../services/catalog-admin.service';
import { ProductImageDto } from '../models/catalog-admin.model';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-image-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-manager.component.html',
})
export class ImageManagerComponent implements OnChanges {
  @Input({ required: true }) productId!: string;
  images: ProductImageDto[] = [];

  constructor(
    private catalog: CatalogAdminService,
    private toast: ToastService
  ) {}

  ngOnChanges(): void {
    if (this.productId) this.load();
  }

  private load(): void {
    this.catalog.getImages(this.productId).subscribe((images) => (this.images = images));
  }

  onFileSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;
    this.catalog.uploadImage(this.productId, files[0]).subscribe({
      next: () => {
        this.toast.success('Image uploaded.');
        this.load();
      },
      error: () => this.toast.error('Failed to upload image.'),
    });
  }

  onSetPrimary(image: ProductImageDto): void {
    this.catalog.setPrimaryImage(image.id).subscribe({
      next: () => {
        this.toast.success('Primary image updated.');
        this.load();
      },
      error: () => this.toast.error('Failed to set primary image.'),
    });
  }

  onMoveUp(index: number): void {
    if (index <= 0) return;
    const reordered = [...this.images];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    this.catalog.reorderImages(this.productId, reordered.map((i) => i.id)).subscribe({
      next: () => {
        this.images = reordered;
        this.load();
      },
      error: () => this.toast.error('Failed to reorder images.'),
    });
  }

  onDelete(image: ProductImageDto): void {
    this.catalog.deleteImage(image.id).subscribe({
      next: () => {
        this.toast.success('Image deleted.');
        this.load();
      },
      error: () => this.toast.error('Failed to delete image.'),
    });
  }
}
