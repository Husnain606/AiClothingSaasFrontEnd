import { Injectable } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { environment } from '@env/environment';
import { AuthService } from './auth.service';
import { NotificationDto } from '../../admin/notifications/models/notification.model';

// Backend hub path (NotificationsHub.cs) — plain WebSocket/SSE endpoint, NOT under the
// REST `/api` prefix, so it's derived by stripping the trailing `/api` from apiBaseUrl
// rather than reusing ApiService (which always prefixes `/api`).
const HUB_PATH = '/hubs/notifications';

@Injectable({ providedIn: 'root' })
export class NotificationHubService {
  private connection: HubConnection | null = null;
  private readonly received = new Subject<NotificationDto>();

  /** Emits every `ReceiveNotification` push from the hub while connected. */
  readonly notificationReceived$: Observable<NotificationDto> = this.received.asObservable();

  constructor(private authService: AuthService) {}

  /**
   * Connects (idempotent — a no-op if already connecting/connected). Group membership
   * (`tenant:{tenantId}`, `user:{userId}`) is derived server-side from the JWT on
   * `OnConnectedAsync` — the client never supplies or requests a group id.
   */
  connect(): void {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      return;
    }

    const hubBaseUrl = environment.apiBaseUrl.replace(/\/api\/?$/, '');
    const connection = new HubConnectionBuilder()
      .withUrl(`${hubBaseUrl}${HUB_PATH}`, {
        accessTokenFactory: () => this.authService.getToken() ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    // Registered once on the HubConnection instance — survives automatic reconnects, so no
    // re-registration is needed in `onreconnected`.
    connection.on('ReceiveNotification', (notification: NotificationDto) => {
      this.received.next(notification);
    });

    this.connection = connection;
    connection.start().catch((err: unknown) => {
      console.error('Failed to connect to the notifications hub', err);
    });
  }

  disconnect(): void {
    const connection = this.connection;
    this.connection = null;
    void connection?.stop();
  }
}
