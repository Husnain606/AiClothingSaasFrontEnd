import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * SECURITY WARNING — this pipe BYPASSES Angular's built-in HTML sanitizer.
 *
 * Use it ONLY for app-authored, fully trusted HTML (e.g. static content
 * hard-coded in this codebase). NEVER pipe user-supplied or API-supplied
 * content (product descriptions, reviews, CMS payloads, query params, etc.)
 * through it — doing so opens a direct XSS vulnerability.
 *
 * If you need to render rich text from an untrusted source, sanitize it
 * instead: `sanitizer.sanitize(SecurityContext.HTML, value)`.
 */
@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
