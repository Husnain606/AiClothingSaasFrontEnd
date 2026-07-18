import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatProductContext } from '../models/chat.model';

/**
 * Shared, RxJS-backed state for the product context the storefront-wide chat widget
 * should attach to /api/chat calls (Phase 6 plan §F5, OPEN QUESTION 4 — resolved as
 * option (a): a lightweight shared service; pages set/clear it, the widget reads it).
 */
@Injectable({ providedIn: 'root' })
export class ChatContextService {
  private readonly contextSubject = new BehaviorSubject<ChatProductContext | null>(null);
  readonly context$ = this.contextSubject.asObservable();

  get current(): ChatProductContext | null {
    return this.contextSubject.value;
  }

  setContext(context: ChatProductContext): void {
    this.contextSubject.next(context);
  }

  clearContext(): void {
    this.contextSubject.next(null);
  }
}
