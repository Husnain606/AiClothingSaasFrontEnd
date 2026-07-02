import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appLazyLoadImage]',
  standalone: true,
})
export class LazyLoadImageDirective implements OnInit, OnDestroy {
  @Input() appLazyLoadImage!: string;
  @Input() placeholderUrl?: string;

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    if ('IntersectionObserver' in window) {
      this.setupLazyLoad();
    } else {
      this.loadImage();
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupLazyLoad(): void {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage();
          if (this.observer) {
            this.observer.unobserve(this.el.nativeElement);
          }
        }
      });
    });

    this.observer.observe(this.el.nativeElement);

    if (this.placeholderUrl) {
      this.el.nativeElement.src = this.placeholderUrl;
    }
  }

  private loadImage(): void {
    const img = this.el.nativeElement;
    img.addEventListener('load', () => {
      img.classList.add('loaded');
    });
    img.src = this.appLazyLoadImage;
  }
}
