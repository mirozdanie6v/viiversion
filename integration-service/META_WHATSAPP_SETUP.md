# VIIVERSION WhatsApp Coexistence — Meta Setup

## Production endpoint

- Integration service: `https://integration.viiversion.com`
- Webhook callback: `https://integration.viiversion.com/webhooks/whatsapp`
- ChatGPT action contract: `integration-service/openapi-whatsapp.yaml`

The VIIVERSION backend is already implemented for WhatsApp Business App Coexistence. No OpenAI API or third-party browser agent is part of this path.

## Embedded Signup version

Use **Embedded Signup v4** in Meta's configuration builder. VIIVERSION launches v4 with `featureType=whatsapp_business_app_onboarding`; the legacy `sessionInfoVersion` launch override is intentionally omitted. The current Graph API pin remains `v26.0`.

## Meta-side prerequisites

Create or use a Meta Business portfolio and a Meta Developer app intended for business/WhatsApp use.

For an Embedded Signup / Tech Provider release, request the Meta permissions required by the WhatsApp onboarding and messaging flow, including:

- `business_management`
- `whatsapp_business_management`
- `whatsapp_business_messaging`

Meta App Review / Advanced Access is a Meta-side release gate.

## Values VIIVERSION needs once the Meta app exists

Only three Meta values are needed to configure the integration service:

1. Meta App ID
2. Meta App Secret
3. WhatsApp Embedded Signup Configuration ID

Do not commit the App Secret to GitHub.

VIIVERSION stores the App Secret encrypted in the existing Durable Object using `DATA_ENCRYPTION_KEY`. The private config endpoint generates the webhook verify token automatically.

## Private setup actions

### Store Meta configuration

`POST /admin/whatsapp/meta-config`

Body:

```json
{
  "appId": "<META_APP_ID>",
  "appSecret": "<META_APP_SECRET>",
  "embeddedSignupConfigId": "<EMBEDDED_SIGNUP_CONFIG_ID>"
}
```

The response contains safe Meta Dashboard values:

- callback URL
- generated verify token
- App ID
- Embedded Signup Configuration ID

The App Secret is never returned.

### Read safe Meta setup values

`GET /admin/whatsapp/meta-config`

### Create the one-time connection link

`POST /admin/whatsapp/onboarding-session`

The returned URL is valid for 15 minutes and opens VIIVERSION's Meta Embedded Signup page.

## Coexistence onboarding behavior

The Embedded Signup page launches Meta with the WhatsApp Business App onboarding feature.

After Meta returns the authorization code, WABA ID and phone number information, VIIVERSION automatically:

1. exchanges the code server-side;
2. subscribes the VIIVERSION app to the WABA;
3. discovers the WhatsApp phone number ID;
4. verifies Coexistence state;
5. encrypts and stores the resulting access token;
6. requests Business App contact synchronization;
7. requests available message-history synchronization.

No Cloudflare secret copy/paste is required for the resulting phone-number token.

## Webhook fields

VIIVERSION subscribes to and handles:

- `messages`
- `history`
- `smb_app_state_sync`
- `smb_message_echoes`
- `account_update`
- `phone_number_quality_update`

Behavior:

- current client messages are stored as inbound `cloud_api`;
- historical messages are imported as `history` and marked reviewed, so old history does not appear as new/unread;
- messages sent manually from WhatsApp Business are stored as outbound `business_app`;
- messages sent by VIIVERSION are stored as outbound `api`;
- synchronized contacts are indexed separately for search and chat naming.

## ChatGPT-facing actions

The private OpenAPI contract exposes:

- `whatsappStatus`
- `whatsappCreateOnboardingLink`
- `whatsappGetMetaConfig`
- `whatsappSetMetaConfig`
- `whatsappListChats`
- `whatsappListContacts`
- `whatsappSyncStatus`
- `whatsappGetMessages`
- `whatsappGetUnread`
- `whatsappMarkReviewed`
- `whatsappSendText`

These actions use the existing VIIVERSION integration authorization boundary and do not call OpenAI API.
