import { describe, expect, it } from 'vitest';
import {
  matchBrowserClient,
  normalizeBrowserRecipient,
  parseWhatsAppPrePlainText,
} from '../src/whatsapp-browser-utils';

describe('WhatsApp Web bridge primitives', () => {
  it('normalizes WhatsApp recipients', () => {
    expect(normalizeBrowserRecipient('+84 769 519 452')).toBe('84769519452');
    expect(normalizeBrowserRecipient('+996 (228) 910-432')).toBe('996228910432');
  });

  it('rejects invalid recipients', () => {
    expect(() => normalizeBrowserRecipient('123')).toThrow();
    expect(() => normalizeBrowserRecipient('not-a-phone')).toThrow();
  });

  it('parses WhatsApp message metadata', () => {
    expect(parseWhatsAppPrePlainText('[18:15, 30/09/2026] Valeria: ')).toEqual({
      time: '18:15',
      date: '30/09/2026',
      sender: 'Valeria',
    });
    expect(parseWhatsAppPrePlainText('[6:05 PM, 30/09/26] Love Travel: ')).toEqual({
      time: '18:05',
      date: '30/09/2026',
      sender: 'Love Travel',
    });
  });

  it('matches live chats to client records by alias or phone', () => {
    const clients = [
      { id: 'max-tour', name: 'MAX TOUR', phone: '+84 123 456 789', aliases: ['Валерия'] },
      { id: 'love-travel', name: 'Nha Trang Love Travel', phone: '+84 987 654 321', aliases: ['Love Travel'] },
    ];

    expect(matchBrowserClient('Валерия', clients)?.id).toBe('max-tour');
    expect(matchBrowserClient('+84 987 654 321', clients)?.id).toBe('love-travel');
    expect(matchBrowserClient('Unknown company', clients)).toBeNull();
  });
});
