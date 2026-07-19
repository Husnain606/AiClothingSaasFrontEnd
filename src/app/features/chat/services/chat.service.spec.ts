import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChatService } from './chat.service';
import { ChatMessage } from '../models/chat.model';
import { environment } from '../../../../environments/environment';

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('posts { messages, productContext } JSON to the chat endpoint', () => {
    const productContext = { name: 'Shirt', description: 'A shirt', sizes: ['M', 'L'] };

    service.sendMessage('Does it run small?', productContext).subscribe();

    const req = httpMock.expectOne(`${environment.tryOnApiBaseUrl}/chat`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      messages: [{ role: 'user', content: 'Does it run small?' }],
      productContext,
    });
    req.flush({ isSuccess: true, statusCode: 200, message: 'Success', data: { reply: 'It fits true to size.' }, errors: null });
  });

  it('appends the user message to messages$ before the response arrives', () => {
    let messages: ChatMessage[] = [];
    service.messages$.subscribe((m) => (messages = m));

    service.sendMessage('Hello').subscribe();

    // No flush yet — the optimistic history update already happened.
    expect(messages).toEqual([{ role: 'user', content: 'Hello' }]);
    httpMock.expectOne(`${environment.tryOnApiBaseUrl}/chat`).flush({
      isSuccess: true,
      statusCode: 200,
      message: 'Success',
      data: { reply: 'Hi!' },
      errors: null,
    });
  });

  it("appends the model's reply to messages$ on success", () => {
    let messages: ChatMessage[] = [];
    service.messages$.subscribe((m) => (messages = m));

    service.sendMessage('Hello').subscribe();
    httpMock.expectOne(`${environment.tryOnApiBaseUrl}/chat`).flush({
      isSuccess: true,
      statusCode: 200,
      message: 'Success',
      data: { reply: 'Hi! How can I help?' },
      errors: null,
    });

    expect(messages).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'model', content: 'Hi! How can I help?' },
    ]);
  });

  it('caps messages$ at 20 entries when sending beyond that count', () => {
    let messages: ChatMessage[] = [];
    service.messages$.subscribe((m) => (messages = m));

    // Each send adds 2 entries (user + model reply); 11 sends would be 22 uncapped.
    for (let i = 0; i < 11; i++) {
      service.sendMessage(`message ${i}`).subscribe();
      httpMock.expectOne(`${environment.tryOnApiBaseUrl}/chat`).flush({
        isSuccess: true,
        statusCode: 200,
        message: 'Success',
        data: { reply: `reply ${i}` },
        errors: null,
      });
    }

    expect(messages.length).toBe(20);
    expect(messages[messages.length - 1]).toEqual({ role: 'model', content: 'reply 10' });
  });

  it('caps history by total characters before sending', () => {
    // First exchange: a 6000-char user message plus a short reply.
    const bigOld = 'a'.repeat(6000);
    service.sendMessage(bigOld).subscribe();
    httpMock.expectOne(`${environment.tryOnApiBaseUrl}/chat`).flush({
      isSuccess: true,
      statusCode: 200,
      message: 'Success',
      data: { reply: 'ok' },
      errors: null,
    });

    // Second send pushes the total past 8000 chars — the oldest message must be trimmed,
    // and the just-typed newest message must survive.
    const bigNew = 'b'.repeat(5000);
    service.sendMessage(bigNew).subscribe();

    const req = httpMock.expectOne(`${environment.tryOnApiBaseUrl}/chat`);
    const sent = req.request.body.messages as ChatMessage[];
    const totalChars = sent.reduce((sum, m) => sum + m.content.length, 0);
    expect(totalChars).toBeLessThanOrEqual(8000);
    expect(sent.some((m) => m.content === bigOld)).toBe(false);
    expect(sent[sent.length - 1]).toEqual({ role: 'user', content: bigNew });
    req.flush({ isSuccess: true, statusCode: 200, message: 'Success', data: { reply: 'ok' }, errors: null });
  });

  it('throws when the response envelope has no data', () => {
    const error = vi.fn();

    service.sendMessage('Hello').subscribe({ next: () => {}, error });

    httpMock.expectOne(`${environment.tryOnApiBaseUrl}/chat`).flush({
      isSuccess: false,
      statusCode: 429,
      message: 'Quota exceeded.',
      data: null,
      errors: null,
    });

    expect(error).toHaveBeenCalled();
  });
});
