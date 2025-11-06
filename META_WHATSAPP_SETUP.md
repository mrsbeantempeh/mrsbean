# Meta WhatsApp Business API Setup Guide

Quick setup guide for configuring Meta WhatsApp Business API with your access token.

## Required Information

You'll need:
1. **Access Token** (you mentioned you have this ✅)
2. **Phone Number ID** (WhatsApp Business phone number ID)

## Finding Your Phone Number ID

1. Go to [Meta Business Suite](https://business.facebook.com)
2. Navigate to **WhatsApp Business Platform**
3. Go to **API Setup** or **Phone Numbers**
4. Copy your **Phone Number ID** (it's a long numeric ID, e.g., `123456789012345`)

## Environment Variables Setup

Add these to your `.env.local` file:

```env
# Meta WhatsApp Business API Configuration
META_WHATSAPP_ACCESS_TOKEN=
META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
```

## Quick Setup Steps

1. **Open `.env.local` file** in the root directory
2. **Add the two variables above** with your actual values:
   - Replace `your_access_token_here` with your Meta access token
   - Replace `your_phone_number_id_here` with your WhatsApp Business phone number ID
3. **Save the file**
4. **Restart your development server** if running:
   ```bash
   npm run dev
   ```

## Testing

Once configured:

1. Make a test purchase on your website
2. After successful payment, check if WhatsApp message is sent
3. Check server logs for any errors if message doesn't arrive

## Phone Number Format

- The system automatically formats phone numbers to include country code
- Indian numbers are automatically formatted as `+91XXXXXXXXXX`
- Meta API requires numbers without the `+` sign (handled automatically in code)

## Troubleshooting

### Message Not Sending

1. **Check Access Token**
   - Ensure token is valid and not expired
   - Verify token has `whatsapp_business_messaging` permission

2. **Check Phone Number ID**
   - Ensure Phone Number ID is correct
   - It should be numeric only (no spaces or special characters)

3. **Check Server Logs**
   - Look for error messages in server console
   - Meta API returns detailed error codes

4. **Common Errors**
   - `401 Unauthorized`: Invalid or expired access token
   - `403 Forbidden`: Missing permissions on access token
   - `400 Bad Request`: Invalid phone number format or Phone Number ID

### Access Token Permissions

Your access token needs these permissions:
- ✅ `whatsapp_business_messaging`
- ✅ `whatsapp_business_management` (optional but recommended)

### Testing in Development

- Meta WhatsApp Business API works in both development and production
- Ensure your phone number is registered with Meta Business Account
- Customer phone numbers must be opted-in (for production)

## API Version

Currently using: **v18.0**

You can update the version in `/app/api/whatsapp/send-message/route.ts` if needed:
```typescript
const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`
```

## Next Steps

1. Add credentials to `.env.local`
2. Test with a real purchase
3. Monitor server logs for any issues
4. Check delivery status in Meta Business Suite

## Support

- **Meta Developer Docs**: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
- **Meta Business Suite**: [business.facebook.com](https://business.facebook.com)
- **Check API Status**: Check server logs for detailed error messages
