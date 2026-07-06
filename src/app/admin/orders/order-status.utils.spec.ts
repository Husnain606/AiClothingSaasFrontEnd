import { describe, it, expect } from 'vitest';
import { availableActions } from './order-status.utils';

describe('availableActions', () => {
  it('pending orders can be confirmed or cancelled', () => {
    expect(availableActions('pending')).toEqual(['confirm', 'cancel']);
  });
  it('confirmed orders can be shipped or cancelled', () => {
    expect(availableActions('confirmed')).toEqual(['ship', 'cancel']);
  });
  it('shipped orders can only be delivered', () => {
    expect(availableActions('shipped')).toEqual(['deliver']);
  });
  it('delivered orders have no further actions', () => {
    expect(availableActions('delivered')).toEqual([]);
  });
  it('cancelled orders have no further actions', () => {
    expect(availableActions('cancelled')).toEqual([]);
  });
});
