import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NotificationHubService } from './notification-hub.service';
import { AuthService } from './auth.service';

// vi.mock() factories are hoisted above imports, so any outer variable they reference must
// itself be defined inside vi.hoisted() — a bare `const` above would either throw a
// "Cannot access before initialization" ReferenceError once hoisted, or (as observed) silently
// fail to apply, leaving the real @microsoft/signalr module in place and making a real network
// call during the test.
const { mockConnection, mockWithUrl, mockBuilderCtor } = vi.hoisted(() => {
  const connection = {
    on: vi.fn(),
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    state: 'Disconnected',
  };
  const withUrl = vi.fn();
  const builderInstance: {
    withUrl: (...args: unknown[]) => typeof builderInstance;
    withAutomaticReconnect: () => typeof builderInstance;
    configureLogging: () => typeof builderInstance;
    build: () => typeof connection;
  } = {
    withUrl: (...args: unknown[]) => {
      withUrl(...args);
      return builderInstance;
    },
    withAutomaticReconnect: () => builderInstance,
    configureLogging: () => builderInstance,
    build: () => connection,
  };
  // A plain function, not an arrow function — arrow functions have no [[Construct]] slot,
  // so `new HubConnectionBuilder()` in the service under test would throw
  // "is not a constructor" if this were `() => builderInstance`.
  const builderCtor = vi.fn(function HubConnectionBuilderMock() {
    return builderInstance;
  });
  return { mockConnection: connection, mockWithUrl: withUrl, mockBuilderCtor: builderCtor };
});

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: mockBuilderCtor,
  HubConnectionState: { Disconnected: 'Disconnected', Connected: 'Connected' },
  LogLevel: { Warning: 2 },
}));

describe('NotificationHubService', () => {
  let service: NotificationHubService;
  let mockAuth: Partial<AuthService>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
    mockConnection.state = 'Disconnected';
    mockAuth = { getToken: vi.fn().mockReturnValue('jwt-token') };
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: mockAuth }],
    });
    service = TestBed.inject(NotificationHubService);
  });

  it('connects with accessTokenFactory and joins via server-derived groups (no client-supplied ids)', () => {
    service.connect();

    expect(mockWithUrl).toHaveBeenCalledTimes(1);
    const [url, options] = mockWithUrl.mock.calls[0] as [string, { accessTokenFactory: () => string }];
    expect(url).toMatch(/\/hubs\/notifications$/);
    // Group membership (tenant:{id}, user:{id}) is derived server-side from the JWT on
    // connect — the client must never encode a tenant/user id into the hub URL itself.
    expect(url).not.toMatch(/tenant|user/i);
    expect(options.accessTokenFactory()).toBe('jwt-token');
    expect(mockConnection.start).toHaveBeenCalledTimes(1);
  });

  it('reconnects and re-subscribes ReceiveNotification handler', () => {
    service.connect();

    expect(mockConnection.on).toHaveBeenCalledWith('ReceiveNotification', expect.any(Function));
    // The handler is bound once directly on the HubConnection instance, which
    // @microsoft/signalr keeps intact across automatic reconnects — so no duplicate
    // registration should ever happen from a single connect() call.
    expect(mockConnection.on).toHaveBeenCalledTimes(1);

    const handler = mockConnection.on.mock.calls[0][1] as (n: unknown) => void;
    const received: unknown[] = [];
    service.notificationReceived$.subscribe((n) => received.push(n));
    handler({ id: '1' });
    expect(received).toEqual([{ id: '1' }]);
  });
});
