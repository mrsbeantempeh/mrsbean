# WhatsApp Business API Setup Guide

This guide explains how to set up automated WhatsApp messages for order confirmations.

## Overview

After a successful payment, customers automatically receive a WhatsApp message with:
- Order confirmation
- Order ID
- Payment amount
- Delivery address
- Delivery timeline (24 hours)
- Contact information

## Provider Options

You can use one of the following WhatsApp Business API providers:

### Option 1: Twilio WhatsApp API (Recommended)

Twilio provides a reliable WhatsApp Business API that's easy to integrate.

#### Setup Steps:

1. **Sign up for Twilio**
   - Go to [twilio.com](https://www.twilio.com)
   - Create an account (free trial available)

2. **Get WhatsApp Sandbox Access**
   - Go to [Twilio Console](https://console.twilio.com/us1/develop/sms/sandbox)
   - Navigate to Messaging > Try it out > Send a WhatsApp message
   - Follow the instructions to join the sandbox
   - Note your WhatsApp number (format: `whatsapp:+14155238886`)

3. **Get Your Credentials**
   - Account SID: Found in [Twilio Console Dashboard](https://console.twilio.com)
   - Auth Token: Found in [Twilio Console Dashboard](https://console.twilio.com)

4. **Add Environment Variables**
   
   Add to your `.env.local` file:
   ```env
   # Twilio WhatsApp Configuration
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```

5. **Production Setup**
   - Apply for production WhatsApp access through Twilio
   - Upgrade to a paid account
   - Get your production WhatsApp number approved

### Option 2: WhatsApp Business API (Meta Cloud API)

Use Meta's official WhatsApp Business API through Meta Business.

#### Setup Steps:

1. **Create Meta Business Account**
   - Go to [business.facebook.com](https://business.facebook.com)
   - Create a Business Account

2. **Set up WhatsApp Business API**
   - Go to [Meta for Developers](https://developers.facebook.com)
   - Create a new app
   - Add WhatsApp Business API product
   - Complete business verification (required)

3. **Get API Credentials**
   - Get your API access token
   - Get your Business Phone Number ID

4. **Add Environment Variables**
   
   Add to your `.env.local` file:
   ```env
   # WhatsApp Business API Configuration
   WHATSAPP_API_URL=https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages
   WHATSAPP_API_KEY=your_access_token_here
   WHATSAPP_BUSINESS_PHONE_ID=your_phone_number_id_here
   ```

### Option 3: Third-Party Providers

Other options include:
- **360dialog**: [360dialog.com](https://www.360dialog.com)
- **Wati.io**: [wati.io](https://www.wati.io)
- **MessageBird**: [messagebird.com](https://www.messagebird.com)

For these providers, check their API documentation for:
- `WHATSAPP_API_URL`: Their API endpoint URL
- `WHATSAPP_API_KEY`: Your API key/token
- Request format (may need to adjust code in `/app/api/whatsapp/send-message/route.ts`)

## Testing

1. **Without Provider Setup**
   - The system will log WhatsApp messages without sending them
   - Check server logs to see what messages would be sent
   - Payment flow continues normally even if WhatsApp fails

2. **With Provider Setup**
   - Make a test purchase
   - Verify you receive WhatsApp message
   - Check message formatting and content

## Message Format

The automated WhatsApp message includes:

```
🎉 Thank you for your order, [Customer Name]!

📦 Order ID: [ORDER_ID]
💰 Amount: ₹[TOTAL]
📊 Quantity: [QTY]x [PRODUCT_NAME]

✅ Your payment of ₹[TOTAL] has been confirmed.

🚚 Delivery: We'll deliver your order within 24 hours to:
[DELIVERY_ADDRESS]

📞 Need help? Reply to this message or call +91 75585 34933

Thank you for choosing Mrs Bean! ❤️
```

## Troubleshooting

### Messages Not Sending

1. **Check Environment Variables**
   - Verify all required environment variables are set
   - Check `.env.local` file exists and has correct values

2. **Check Server Logs**
   - Look for WhatsApp API errors in server console
   - Check for authentication errors

3. **Verify Phone Number Format**
   - Phone numbers are automatically formatted to `+91XXXXXXXXXX`
   - Ensure customer phone number is valid

4. **Provider-Specific Issues**
   - **Twilio**: Check sandbox status and production approval
   - **Meta API**: Verify business verification status
   - **Third-party**: Check API documentation for specific requirements

### Common Errors

- **Authentication Failed**: Check API keys/tokens
- **Invalid Phone Number**: Ensure phone format is correct
- **Rate Limiting**: Check provider limits and upgrade if needed

## Production Checklist

- [ ] Choose and set up WhatsApp Business API provider
- [ ] Complete provider verification (if required)
- [ ] Add all environment variables to production `.env`
- [ ] Test order flow end-to-end
- [ ] Verify WhatsApp messages are received
- [ ] Monitor for any delivery failures
- [ ] Set up error alerting (optional)

## Notes

- WhatsApp messages are sent asynchronously and won't block the payment flow
- If WhatsApp sending fails, the order still completes successfully
- Messages are only sent for verified successful payments (`status: 'success'`)
- Phone numbers are automatically formatted to include country code (+91)

## Support

For provider-specific issues:
- **Twilio**: [twilio.com/support](https://support.twilio.com)
- **Meta**: [developers.facebook.com/support](https://developers.facebook.com/support)
- **360dialog**: Check their documentation portal

For code-related issues, check the server logs and ensure all environment variables are correctly set.
