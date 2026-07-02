import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should truncate text exceeding limit', () => {
    const result = pipe.transform('This is a long text', 10);
    expect(result).toBe('This is a ...');
  });

  it('should not truncate text within limit', () => {
    const result = pipe.transform('Short text', 20);
    expect(result).toBe('Short text');
  });

  it('should use custom ellipsis', () => {
    const result = pipe.transform('This is a long text', 10, '***');
    expect(result).toBe('This is a ***');
  });

  it('should handle null value', () => {
    const result = pipe.transform(null, 10);
    expect(result).toBe('');
  });

  it('should handle undefined value', () => {
    const result = pipe.transform(undefined, 10);
    expect(result).toBe('');
  });

  it('should use default limit of 50', () => {
    const longText = 'a'.repeat(100);
    const result = pipe.transform(longText);
    expect(result.length).toBe(53);
  });

  it('should use default ellipsis of ...', () => {
    const result = pipe.transform('This is a long text', 10);
    expect(result).toContain('...');
  });
});
