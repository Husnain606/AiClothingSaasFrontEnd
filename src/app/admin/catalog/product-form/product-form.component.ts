import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CatalogAdminService } from '../services/catalog-admin.service';
import { CategoryDto } from '../models/catalog-admin.model';
import { ToastService } from '../../shared/services/toast.service';
import { VariantTableComponent } from '../variants/variant-table.component';
import { ImageManagerComponent } from '../images/image-manager.component';

interface ProductFormControls {
  name: FormControl<string>;
  slug: FormControl<string>;
  description: FormControl<string>;
  categoryId: FormControl<string>;
  basePrice: FormControl<number>;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, VariantTableComponent, ImageManagerComponent],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  isEditMode = false;
  productId: string | null = null;
  categories: CategoryDto[] = [];
  form: FormGroup<ProductFormControls>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private catalog: CatalogAdminService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      name: this.fb.nonNullable.control('', Validators.required),
      slug: this.fb.nonNullable.control('', Validators.required),
      description: this.fb.nonNullable.control('', Validators.required),
      categoryId: this.fb.nonNullable.control('', Validators.required),
      basePrice: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0.01)]),
    });
  }

  ngOnInit(): void {
    this.catalog.getCategories().subscribe((categories) => (this.categories = categories));
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.productId = id;
      this.catalog.getProduct(id).subscribe((product) => {
        this.form.setValue({
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          categoryId: product.categoryId,
          basePrice: product.basePrice,
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();
    const save =
      this.isEditMode && this.productId
        ? this.catalog.updateProduct(this.productId, payload)
        : this.catalog.createProduct(payload);

    save.subscribe({
      next: () => {
        this.toast.success(this.isEditMode ? 'Product updated.' : 'Product created.');
        this.router.navigate(['/admin/catalog']);
      },
      error: () => this.toast.error('Failed to save product.'),
    });
  }
}
