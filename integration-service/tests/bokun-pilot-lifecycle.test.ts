import { it, expect } from 'vitest';
import { readPilotBooking, confirmPilotBooking } from '../src/bokun';
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
