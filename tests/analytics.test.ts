import { describe, expect, it } from 'vitest';
import {
  allowedViiversionHost,
  clampDays,
  clean,
  constantTimeEqual,
  optionalNumber,
  projectName,
  safePageUrl,
  safePath,
  sanitizeQuery,
} from '../src/worker/analytics';

describe('analytics helpers', () => {
  it('accepts only viiversion hosts', () => {
    expect(allowedViiversionHost('viiversion.com')).toBe(true);
    expect(allowedViiversionHost('max-tour.viiversion.com')).toBe(true);
    expect(allowedViiversionHost('viiversion.com.evil.test')).toBe(false);
  });

  it('maps known projects and safely falls back', () => {
    expect(projectName('max-tour.viiversion.com')).toBe('MAX TOUR');
    expect(projectName('demo.viiversion.com', 'Demo Project')).toBe('Demo Project');
  });

  it('bounds input and reporting range', () => {
    expect(clean('abc\u0000def', 20)).toBe('abcdef');
    expect(clampDays('999')).toBe(365);
    expect(clampDays('0')).toBe(1);
    expect(safePath('/tour?id=1#x')).toBe('/tour');
    expect(optionalNumber('999', 0, 100)).toBe(100);
    expect(optionalNumber('bad', 0, 100)).toBeNull();
  });

  it('redacts secret-like URL parameters but preserves campaign analytics', () => {
    const query = sanitizeQuery('?utm_source=proposal&token=secret&code=abc&vv_campaign=client-1');
    expect(query).toContain('utm_source=proposal');
    expect(query).toContain('vv_campaign=client-1');
    expect(query).not.toContain('secret');
    expect(query).not.toContain('abc');
    expect(query).toContain('%5BREDACTED%5D');
  });

  it('stores only VIIVERSION page URLs and redacts secrets', () => {
    const safe = safePageUrl('https://max-tour.viiversion.com/tour?id=7&access_token=abc#price');
    expect(safe).toContain('max-tour.viiversion.com/tour');
    expect(safe).toContain('id=7');
    expect(safe).not.toContain('abc');
    expect(safePageUrl('https://evil.test/collect?x=1')).toBe('');
  });

  it('uses constant length-aware comparison', () => {
    expect(constantTimeEqual('abc', 'abc')).toBe(true);
    expect(constantTimeEqual('abc', 'abd')).toBe(false);
    expect(constantTimeEqual('abc', 'ab')).toBe(false);
  });
});
