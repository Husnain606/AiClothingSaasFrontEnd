import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  @Input() appHighlight = '#FFFF00';
  @Input() defaultColor = '';

  private defaultBackgroundColor = '';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter(): void {
    this.defaultBackgroundColor = this.el.nativeElement.style.backgroundColor;
    this.setBackgroundColor(this.appHighlight);
  }

  @HostListener('mouseleave') onMouseLeave(): void {
    this.setBackgroundColor(this.defaultColor || this.defaultBackgroundColor);
  }

  private setBackgroundColor(color: string): void {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
