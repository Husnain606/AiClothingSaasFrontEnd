// Mirrors FashionSaaS.Application.Notifications.DTOs.NotificationResponse (camelCase on the
// wire; enum serialized as its string name via JsonStringEnumConverter, see Program.cs).
export type NotificationTypeName =
  | 'OrderPlaced'
  | 'OrderStatusChanged'
  | 'PaymentConfirmed'
  | 'LowStock'
  | 'ReviewSubmitted'
  | 'TryOnCompleted'
  | 'TryOnFailed';

export interface NotificationDto {
  id: string;
  type: NotificationTypeName;
  title: string;
  message: string;
  entityName: string;
  entityId: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationFilterParams {
  page?: number;
  pageSize?: number;
}
