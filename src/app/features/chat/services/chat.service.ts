import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ChatApiResponse, ChatMessage, ChatProductContext, ChatResult } from '../models/chat.model';

const MAX_MESSAGES = 20;
// Matches the backend's ChatHistoryMaxTotalChars cap — trim oldest messages so the
// total content length stays within it (the newest message is never trimmed away).
const MAX_TOTAL_CHARS = 8000;

function capHistory(messages: ChatMessage[]): ChatMessage[] {
  let capped = messages.slice(-MAX_MESSAGES);
  let totalChars = capped.reduce((sum, m) => sum + m.content.length, 0);
  while (capped.length > 1 && totalChars > MAX_TOTAL_CHARS) {
    totalChars -= capped[0].content.length;
    capped = capped.slice(1);
  }
  return capped;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {}

  sendMessage(content: string, productContext?: ChatProductContext): Observable<ChatResult> {
    const userMessage: ChatMessage = { role: 'user', content };
    const history = capHistory([...this.messagesSubject.value, userMessage]);
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
          const withReply = capHistory([
            ...this.messagesSubject.value,
            { role: 'model', content: result.reply } as ChatMessage,
          ]);
          this.messagesSubject.next(withReply);
        })
      );
  }

  clear(): void {
    this.messagesSubject.next([]);
  }
}
