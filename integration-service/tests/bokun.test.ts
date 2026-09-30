import { describe, expect, it } from 'vitest';
import {
  bokunRestDate,
  canonicalOAuthQuery,
  canonicalVendorId,
  checkoutOptionsPath,
  checkoutSubmitPath,
  pickupPlacesPath,
  productPath,
  signRest,
  validatePilotBookingRequest,
  validatePilotCheckoutRequest,
} from '../src/bokun';

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

  it('builds documented product and pickup paths, including lang', () => {
    expect(productPath('1287580')).toBe('/activity.json/1287580');
    expect(productPath('1287580', 'ko')).toBe('/activity.json/1287580?lang=KO');
    expect(productPath('1287580', 'vi-VN')).toBe('/activity.json/1287580?lang=VI_VN');
    expect(() => productPath('1287580', 'korean')).toThrow();
    expect(pickupPlacesPath('1287580')).toBe('/activity.json/1287580/pickup-places');
    expect(() => pickupPlacesPath('abc')).toThrow();
  });


  it('builds Bókun checkout paths with explicit currency', () => {
    expect(checkoutOptionsPath('usd')).toBe('/checkout.json/options/booking-request?currency=USD');
    expect(checkoutSubmitPath('USD')).toBe('/checkout.json/submit?currency=USD');
    expect(() => checkoutOptionsPath('US')).toThrow();
  });

  it('accepts only configured LoveTravel pilot products and LT-TEST references', () => {
    const env = {
      BOKUN_PRODUCT_IDS: '1287578,1287580',
      BOKUN_DEFAULT_PRODUCT_ID: '1287578',
    } as any;
    const booking = {
      externalBookingReference: 'LT-TEST-READY-001',
      sendCustomerNotification: false,
      activityBookings: [{
        activityId: 1287578,
        passengers: [{ pricingCategoryId: 1250028 }],
      }],
    };
    expect(validatePilotBookingRequest(env, booking)).toBe(booking);
    expect(() => validatePilotBookingRequest(env, {
      ...booking,
      activityBookings: [{ activityId: 9999999, passengers: [{ pricingCategoryId: 1250028 }] }],
    })).toThrow();
    expect(() => validatePilotBookingRequest(env, {
      ...booking,
      externalBookingReference: 'PUBLIC-001',
    })).toThrow();
  });

  it('permits only inert reserve checkout shape for the guarded pilot', () => {
    const env = {
      BOKUN_PRODUCT_IDS: '1287578,1287580',
      BOKUN_DEFAULT_PRODUCT_ID: '1287578',
    } as any;
    const directBooking = {
      externalBookingReference: 'LT-TEST-READY-002',
      sendCustomerNotification: false,
      activityBookings: [{
        activityId: 1287578,
        passengers: [{ pricingCategoryId: 1250028 }],
      }],
    };
    const checkout = {
      checkoutOption: 'CUSTOMER_FULL_PAYMENT',
      paymentMethod: 'RESERVE_FOR_EXTERNAL_PAYMENT',
      source: 'DIRECT_REQUEST',
      directBooking,
      sendNotificationToMainContact: false,
      showPricesInNotification: false,
    };
    expect(validatePilotCheckoutRequest(env, checkout)).toBe(checkout);
    expect(() => validatePilotCheckoutRequest(env, { ...checkout, paymentMethod: 'CARD' })).toThrow();
    expect(() => validatePilotCheckoutRequest(env, { ...checkout, source: 'SHOPPING_CART' })).toThrow();
    expect(() => validatePilotCheckoutRequest(env, { ...checkout, sendNotificationToMainContact: true })).toThrow();
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
