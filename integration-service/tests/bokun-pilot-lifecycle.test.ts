import { it, expect } from 'vitest';
import { readPilotBooking, confirmPilotBooking, submitLoveTravelClientDemoBooking } from '../src/bokun';
it('rejects unauthenticated reads before accessing stored credentials', async () => {
  await expect(readPilotBooking(new Request('https://test'), {} as any, '137689', 'NHA-1')).rejects.toMatchObject({status:401});
});
it('requires explicit confirmation intent even with a test token', async () => {
  await expect(confirmPilotBooking(new Request('https://test'), {} as any, '137689', 'NHA-1')).rejects.toMatchObject({status:412});
});
it('rejects non-pilot code and disallowed vendors', async () => {
  const request = new Request('https://test', {headers:{'x-viiversion-booking-test-token':'test'}});
  const env = {BOKUN_BOOKING_TEST_TOKEN:'test',BOKUN_ALLOWED_VENDOR_IDS:'137689'} as any;
  await expect(readPilotBooking(request, env, '9', 'NHA-1')).rejects.toMatchObject({status:403});
  await expect(readPilotBooking(request, env, '137689', '../other')).rejects.toMatchObject({status:400});
});

it('client demo submit stays server-only and requires explicit intent', async () => {
  const checkout = {
    checkoutOption:'CUSTOMER_FULL_PAYMENT',
    paymentMethod:'RESERVE_FOR_EXTERNAL_PAYMENT',
    source:'DIRECT_REQUEST',
    sendNotificationToMainContact:false,
    showPricesInNotification:false,
    directBooking:{
      externalBookingReference:'LT-TEST-CLIENT-UNIT',
      externalBookingEntityName:'VIIVERSION',
      externalBookingEntityCode:'LOVE_TRAVEL',
      sendCustomerNotification:false,
      activityBookings:[{activityId:1287578,passengers:[{pricingCategoryId:1250028}]}],
    },
  };
  await expect(submitLoveTravelClientDemoBooking(
    new Request('https://test'),
    {LOVE_TRAVEL_CLIENT_DEMO_TOKEN_SHA256:'9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',BOKUN_PRODUCT_IDS:'1287578,1287580'} as any,
    '137689',
    checkout,
  )).rejects.toMatchObject({status:401});

  await expect(submitLoveTravelClientDemoBooking(
    new Request('https://test', {headers:{'x-love-travel-demo-token':'test'}}),
    {LOVE_TRAVEL_CLIENT_DEMO_TOKEN_SHA256:'9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',BOKUN_PRODUCT_IDS:'1287578,1287580'} as any,
    '137689',
    checkout,
  )).rejects.toMatchObject({status:412});
});

it('client demo submit rejects non-client test references before any Bókun write', async () => {
  const request = new Request('https://test', {headers:{
    'x-love-travel-demo-token':'test',
    'x-viiversion-booking-intent':'SUBMIT_LOVE_TRAVEL_CLIENT_DEMO_BOOKING',
  }});
  const checkout = {
    checkoutOption:'CUSTOMER_FULL_PAYMENT',
    paymentMethod:'RESERVE_FOR_EXTERNAL_PAYMENT',
    source:'DIRECT_REQUEST',
    sendNotificationToMainContact:false,
    showPricesInNotification:false,
    directBooking:{
      externalBookingReference:'LT-TEST-OTHER',
      externalBookingEntityName:'VIIVERSION',
      externalBookingEntityCode:'LOVE_TRAVEL',
      sendCustomerNotification:false,
      activityBookings:[{activityId:1287578,passengers:[{pricingCategoryId:1250028}]}],
    },
  };
  await expect(submitLoveTravelClientDemoBooking(
    request,
    {LOVE_TRAVEL_CLIENT_DEMO_TOKEN_SHA256:'9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',BOKUN_PRODUCT_IDS:'1287578,1287580'} as any,
    '137689',
    checkout,
  )).rejects.toMatchObject({status:400});
});
