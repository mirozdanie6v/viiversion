import { describe, expect, it } from 'vitest';
import { bokunRestDate, canonicalOAuthQuery, canonicalVendorId, signRest } from '../src/bokun';

describe('Bókun integration primitives', () => {
  it('canonicalizes OAuth query without hmac', () => {
    const url = new URL('https://integration.viiversion.com/bokun/install?timestamp=10&domain=love&hmac=abc');
    expect(canonicalOAuthQuery(url)).toBe('domain=love&timestamp=10');
  });

  it('formats Bókun REST date', () => {
    expect(bokunRestDate(new Date('2026-09-24T13:14:15.999Z'))).toBe('2026-09-24 13:14:15');
  });

  it('normalizes Bókun relay-style vendor IDs to the numeric vendor ID', () => {
    expect(canonicalVendorId('137689')).toBe('137689');
    expect(canonicalVendorId('QXBwVmVuZG9yVHIwZToxMzc2ODk')).toBe('137689');
  });

  it('matches Bókun published REST signature example', async () => {
    const signature = await signRest(
      '23e2c7da7f7048e5b46f96bc91324800',
      '2013-11-09 14:33:46',
      'de235a6a15c340b6b1e1cb5f3687d04a',
      'POST',
      '/activity.json/search?lang=EN&currency=ISK',
    );
    expect(signature).toBe('XrOiTYa9Y34zscnLCsAEh8ieoyo=');
  });
});
