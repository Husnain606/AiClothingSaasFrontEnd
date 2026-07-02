import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlPipe } from './safe-html.pipe';

describe('SafeHtmlPipe', () => {
  let pipe: SafeHtmlPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new SafeHtmlPipe(sanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should sanitize HTML content', () => {
    const html = '<b>Bold text</b>';
    const result = pipe.transform(html);
    expect(result).toBeTruthy();
  });

  it('should handle null value', () => {
    const result = pipe.transform(null);
    expect(result).toBe('');
  });

  it('should handle undefined value', () => {
    const result = pipe.transform(undefined);
    expect(result).toBe('');
  });

  it('should call bypassSecurityTrustHtml', () => {
    vi.spyOn(sanitizer, 'bypassSecurityTrustHtml');
    const html = '<b>Bold text</b>';
    pipe.transform(html);
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(html);
  });
});
