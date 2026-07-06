import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ImageManagerComponent } from './image-manager.component';
import { CatalogAdminService } from '../services/catalog-admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { ProductImageDto } from '../models/catalog-admin.model';

describe('ImageManagerComponent', () => {
  let fixture: ComponentFixture<ImageManagerComponent>;
  let component: ImageManagerComponent;
  let mockCatalog: Partial<CatalogAdminService>;
  let mockToast: Partial<ToastService>;

  const image: ProductImageDto = { id: 'i1', productId: 'p1', url: 'https://x/img.png', sortOrder: 0, isPrimary: true };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockCatalog = {
      getImages: vi.fn().mockReturnValue(of([image])),
      uploadImage: vi.fn().mockReturnValue(of(image)),
      reorderImages: vi.fn().mockReturnValue(of(undefined)),
      setPrimaryImage: vi.fn().mockReturnValue(of(undefined)),
      deleteImage: vi.fn().mockReturnValue(of(undefined)),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ImageManagerComponent],
      providers: [
        { provide: CatalogAdminService, useValue: mockCatalog },
        { provide: ToastService, useValue: mockToast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ImageManagerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('productId', 'p1');
    fixture.detectChanges();
  });

  it('loads images for the product', () => {
    expect(mockCatalog.getImages).toHaveBeenCalledWith('p1');
    expect(component.images.length).toBe(1);
  });

  it('uploads a selected file', () => {
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    component.onFileSelected({ target: { files: [file] } } as unknown as Event);
    expect(mockCatalog.uploadImage).toHaveBeenCalledWith('p1', file);
  });

  it('sets an image as primary', () => {
    component.onSetPrimary(image);
    expect(mockCatalog.setPrimaryImage).toHaveBeenCalledWith('i1');
  });

  it('reorders images by moving one up', () => {
    component.images = [image, { ...image, id: 'i2', sortOrder: 1 }];
    component.onMoveUp(1);
    expect(mockCatalog.reorderImages).toHaveBeenCalledWith('p1', ['i2', 'i1']);
  });

  it('deletes an image', () => {
    component.onDelete(image);
    expect(mockCatalog.deleteImage).toHaveBeenCalledWith('i1');
  });
});
