import { describe, expect, it } from 'vitest';
import { allowedViiversionHost, clampDays, clean, constantTimeEqual, projectName, safePath } from '../src/worker/analytics';

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
  });

  it('uses constant length-aware comparison', () => {
    expect(constantTimeEqual('abc', 'abc')).toBe(true);
    expect(constantTimeEqual('abc', 'abd')).toBe(false);
    expect(constantTimeEqual('abc', 'ab')).toBe(false);
  });
});
