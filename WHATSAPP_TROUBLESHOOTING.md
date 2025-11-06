# WhatsApp Message Troubleshooting

## Issue: API Returns Success but Message Not Received

If you get a successful response (`messageId`, `wamid`) but the message doesn't arrive on WhatsApp, here are the most common causes:

### 1. ✅ Test Mode Restriction (MOST COMMON)

**Problem**: Meta WhatsApp Business API in test mode only allows sending to phone numbers added to the test recipient list.

**Solution**: Add the phone number as a test recipient:

1. Go to [Meta Business Suite](https://business.facebook.com)
2. Navigate to **WhatsApp Business Platform** → **API Setup** or **Phone Numbers**
3. Find **"To"** or **"Test Recipients"** section
4. Click **"Add Phone Number"**
5. Add the recipient phone number: `919049096801` (without + sign, with country code)
6. Click **"Send Code"** or **"Add"**
7. The recipient should receive a code on WhatsApp to verify
8. Once verified, you can send messages to that number

**Important**: 
- Format: `91XXXXXXXXXX` (country code + number, no + sign)
- Each number needs to be verified individually
- In production mode, this restriction is removed

### 2. ⏰ 24-Hour Customer Service Window

**Problem**: Free-form text messages (type: "text") only work within 24 hours of the recipient's last message to your business number.

**Solution Options**:

**Option A**: Wait for recipient to message you first, then respond within 24 hours

**Option B**: Use template messages (recommended for order confirmations)

Template messages work anytime, but must be pre-approved by Meta. They're perfect for:
- Order confirmations
- First-time customer contact
- Messages after 24-hour window

**How to use templates**:
1. Create a template in Meta Business Suite
2. Get it approved by Meta (usually 24-48 hours)
3. Update code to use template:

```typescript
await fetch('/api/whatsapp/send-message', {
  method: 'POST',
  body: JSON.stringify({
    to: '9049096801',
    message: 'Your message here', // Still required but template body is used
    useTemplate: true,
    templateName: 'order_confirmation', // Your approved template name
    templateLanguage: 'en_US',
  }),
})
```

### 3. 📱 Phone Number Format

**Problem**: Phone number might not be formatted correctly.

**Current Format Being Sent**: `919049096801` (country code + number, no + sign)

**Verify**:
- Phone number is correct
- Includes country code (91 for India)
- No spaces or special characters
- No + sign (removed automatically)

### 4. 🔒 Account Status

**Check**:
- WhatsApp Business Account is active
- Phone number is verified
- Access token is valid and not expired
- Business verification status (if required)

### 5. 📊 Check Message Status

Use Meta's message status API to check delivery:

```bash
curl -i -X GET \
  "https://graph.facebook.com/v22.0/{MESSAGE_ID}?fields=status" \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

Status values:
- `sent`: Message sent to Meta
- `delivered`: Message delivered to WhatsApp
- `read`: Message read by recipient
- `failed`: Message failed (check error code)

## Quick Fixes

### For Test Mode:
1. ✅ Add `919049096801` to test recipients in Meta Business Suite
2. ✅ Verify the number receives a code
3. ✅ Try sending message again

### For Production (Outside 24-hour window):
1. ✅ Create and approve a message template
2. ✅ Update code to use `useTemplate: true`
3. ✅ Use template name instead of free text

## Testing Steps

1. **Check Server Logs**: Look for phone number format in console
2. **Verify Test Recipients**: Confirm number is added in Meta Business Suite
3. **Test with Template**: Try using a template message if available
4. **Check Status API**: Use message ID to check delivery status

## Need Help?

- **Meta Developer Docs**: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
- **Meta Business Suite**: [business.facebook.com](https://business.facebook.com)
- **Check server logs**: Look for phone number and error details

## Next Steps

1. Add `919049096801` to test recipients
2. Verify the number
3. Try sending again
4. If still not working, check message status using the `messageId` returned

