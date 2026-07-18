import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { ChatContextService } from '../../services/chat-context.service';
import { ChatMessage } from '../../models/chat.model';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css'],
})
export class ChatWidgetComponent {
  isOpen$ = new BehaviorSubject<boolean>(false);
  sending$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  draft = new FormControl('');

  readonly messages$: Observable<ChatMessage[]>;

  constructor(
    private chatService: ChatService,
    private chatContext: ChatContextService
  ) {
    this.messages$ = this.chatService.messages$;
  }

  toggle(): void {
    this.isOpen$.next(!this.isOpen$.value);
  }

  send(): void {
    const content = (this.draft.value ?? '').trim();
    if (!content || this.sending$.value) {
      return;
    }

    this.sending$.next(true);
    this.error$.next(null);
    this.draft.setValue('');

    this.chatService.sendMessage(content, this.chatContext.current ?? undefined).subscribe({
      next: () => this.sending$.next(false),
      error: (err) => {
        this.sending$.next(false);
        const status = err?.status;
        this.error$.next(
          status === 429
            ? "You've reached this month's AI usage limit. Upgrade your plan or try again next month."
            : 'The assistant is unavailable right now. Please try again in a moment.'
        );
      },
    });
  }
}
