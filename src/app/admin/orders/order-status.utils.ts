import { OrderStatus } from '../shared/models/order-admin.model';

export function availableActions(status: OrderStatus): Array<'confirm' | 'ship' | 'deliver' | 'cancel'> {
  switch (status) {
    case 'pending':
      return ['confirm', 'cancel'];
    case 'confirmed':
      return ['ship', 'cancel'];
    case 'shipped':
      return ['deliver'];
    case 'delivered':
      return [];
    case 'cancelled':
      return [];
  }
}
