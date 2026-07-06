import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [ToastService] });
    service = TestBed.inject(ToastService);
  });

  it('starts with no toasts', async () => {
    expect(await firstValueFrom(service.toasts$)).toEqual([]);
  });

  it('adds a success toast', async () => {
    service.success('Order confirmed');
    const toasts = await firstValueFrom(service.toasts$);
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({ kind: 'success', text: 'Order confirmed' });
  });

  it('adds toasts of every kind', async () => {
    service.success('a');
    service.error('b');
    service.info('c');
    service.warning('d');
    const toasts = await firstValueFrom(service.toasts$);
    expect(toasts.map((t) => t.kind)).toEqual(['success', 'error', 'info', 'warning']);
  });

  it('assigns unique incrementing ids', async () => {
    service.success('a');
    service.success('b');
    const toasts = await firstValueFrom(service.toasts$);
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });

  it('dismisses a toast by id', async () => {
    service.success('a');
    const [first] = await firstValueFrom(service.toasts$);
    service.dismiss(first.id);
    const toasts = await firstValueFrom(service.toasts$);
    expect(toasts).toHaveLength(0);
  });

  it('auto-dismisses a toast after 5000ms', async () => {
    vi.useFakeTimers();
    service.success('auto-dismiss me');
    expect(await firstValueFrom(service.toasts$)).toHaveLength(1);

    vi.advanceTimersByTime(5000);
    expect(await firstValueFrom(service.toasts$)).toHaveLength(0);
    vi.useRealTimers();
  });
});
