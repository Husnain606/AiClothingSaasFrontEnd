import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ChatApiResponse, ChatMessage, ChatProductContext, ChatResult } from '../models/chat.model';

const MAX_MESSAGES = 20;

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {}

  sendMessage(content: string, productContext?: ChatProductContext): Observable<ChatResult> {
    const userMessage: ChatMessage = { role: 'user', content };
    const history = [...this.messagesSubject.value, userMessage].slice(-MAX_MESSAGES);
    this.messagesSubject.next(history);

    return this.http
      .post<ChatApiResponse<ChatResult>>(`${environment.tryOnApiBaseUrl}/chat`, {
        messages: history,
        productContext: productContext ?? null,
      })
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error(response.message || 'Chat reply failed.');
          }
          return response.data;
        }),
        tap((result) => {
          const withReply = [
            ...this.messagesSubject.value,
            { role: 'model', content: result.reply } as ChatMessage,
          ].slice(-MAX_MESSAGES);
          this.messagesSubject.next(withReply);
        })
      );
  }

  clear(): void {
    this.messagesSubject.next([]);
  }
}
