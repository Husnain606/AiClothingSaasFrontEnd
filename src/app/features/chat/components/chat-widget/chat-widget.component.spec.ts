import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ChatWidgetComponent } from './chat-widget.component';
import { ChatService } from '../../services/chat.service';
import { ChatMessage, ChatResult } from '../../models/chat.model';

describe('ChatWidgetComponent', () => {
  let fixture: ComponentFixture<ChatWidgetComponent>;
  let component: ChatWidgetComponent;
  let messagesSubject: BehaviorSubject<ChatMessage[]>;
  let chatService: { messages$: unknown; sendMessage: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    TestBed.resetTestingModule();

    messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
    chatService = {
      messages$: messagesSubject.asObservable(),
      sendMessage: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ChatWidgetComponent],
      providers: [{ provide: ChatService, useValue: chatService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggling shows and hides the panel', () => {
    expect(fixture.nativeElement.querySelector('.chat-widget__panel')).toBeNull();

    component.toggle();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chat-widget__panel')).toBeTruthy();

    component.toggle();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chat-widget__panel')).toBeNull();
  });

  it('sending a message clears the draft and disables the send control while sending', () => {
    const pending = new Subject<ChatResult>();
    chatService.sendMessage.mockReturnValue(pending.asObservable());

    component.toggle();
    fixture.detectChanges();

    component.draft.setValue('Does this shirt run small?');
    component.send();
    fixture.detectChanges();

    expect(chatService.sendMessage).toHaveBeenCalledWith('Does this shirt run small?', undefined);
    expect(component.draft.value).toBe('');
    const sendButton = fixture.nativeElement.querySelector('.chat-widget__send') as HTMLButtonElement;
    expect(sendButton.disabled).toBe(true);

    pending.next({ reply: 'True to size.' });
    pending.complete();
    fixture.detectChanges();
    expect(sendButton.disabled).toBe(false);
  });

  it("displays the assistant's reply once the mocked service response resolves", () => {
    chatService.sendMessage.mockImplementation((content: string) => {
      const reply = 'It fits true to size.';
      messagesSubject.next([
        { role: 'user', content },
        { role: 'model', content: reply },
      ]);
      return of({ reply });
    });

    component.toggle();
    fixture.detectChanges();

    component.draft.setValue('Does it run small?');
    component.send();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('It fits true to size.');
    const modelMessage = fixture.nativeElement.querySelector('.chat-widget__message--model');
    expect(modelMessage).toBeTruthy();
  });
});
