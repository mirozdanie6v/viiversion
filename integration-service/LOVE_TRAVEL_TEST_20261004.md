# Love Travel booking verification — 2026-10-04

User explicitly requested one confirmed test booking after Hùng reported that NHA-105381046 was not visible.

## Verified results

- Original booking NHA-105381046: Bókun readback status TIMEOUT.
- Replacement booking NHA-105698735 (bookingId 105698735): CONFIRMED.
- Product: Robinson Beach, activity 1287578, adult category 1250028, one passenger.
- Departure selected from live availability: 2026-10-07, startTimeId 5782388 (09:00 local).
- Customer: VIIVERSION / CONFIRMED TEST - DO NOT OPERATE.
- External reference: LT-TEST-CONFIRMED-37189591568.
- Payment: NOT_PAID, totalPaid 0. No payment or charge was recorded.
- Confirmation: POST /booking.json/{code}/confirm?currency=USD&lang=EN&sendCustomerNotification=false with externalBookingReference only; optional payment omitted.
- Independent GET /booking.json/booking/{code} returned CONFIRMED after confirmation.
- Client UI visibility still requires Hùng's verification. No client message was sent by this task.
- Temporary booking token was removed; realBookingWriteEnabled and oneTimeBookingTestArmed both false.

## Checks

Typecheck, 17 tests across 4 test files, Wrangler dry-run, deployment, API confirmation and independent readback passed.

Evidence: https://github.com/mirozdanie6v/rusinfocenter/actions/runs/37189744174

## Limitations and next steps

The API has confirmed this test. The public app checkout remains a separate scope.
The test occupies one place until cancelled. Keep it available for client verification, then cancel the specifically identified test booking.
The checkout confirm-reserved API rejected an amount of zero; the documented booking confirmation API with optional payment succeeded without recording payment.
