import { NextRequest, NextResponse } from 'next/server'

/**
 * WhatsApp Message API Route
 * 
 * Supports Meta WhatsApp Business API (Primary) and Twilio as fallback
 * 
 * Environment variables needed for Meta WhatsApp Business API:
 * 
 * Required:
 * - META_WHATSAPP_ACCESS_TOKEN (Your Meta access token)
 * - META_WHATSAPP_PHONE_NUMBER_ID (Your WhatsApp Business phone number ID)
 * 
 * Optional (for Twilio fallback):
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_WHATSAPP_FROM (format: whatsapp:+14155238886)
 */

interface WhatsAppMessageRequest {
  to: string // Phone number in format: +917558534933 or 917558534933
  message: string
  orderId?: string
  customerName?: string
  useTemplate?: boolean // Optional: use template message instead of text
  templateName?: string // Template name if using template
  templateLanguage?: string // Template language code (default: en_US)
}

export async function POST(request: NextRequest) {
  try {
    const { 
      to, 
      message, 
      orderId, 
      customerName,
      useTemplate = false,
      templateName,
      templateLanguage = 'en_US'
    }: WhatsAppMessageRequest = await request.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to and message' },
        { status: 400 }
      )
    }

    // Normalize phone number (remove spaces, ensure +91 prefix for India)
    let phoneNumber = to.replace(/\s+/g, '').replace(/^0+/, '')
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('91')) {
        phoneNumber = '+' + phoneNumber
      } else {
        phoneNumber = '+91' + phoneNumber
      }
    }

    // Try Meta WhatsApp Business API first (Option 2)
    // Support both new and legacy variable names
    const metaAccessToken = process.env.META_WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_API_KEY
    const metaPhoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_BUSINESS_PHONE_ID

    if (metaAccessToken && metaPhoneNumberId) {
      return await sendViaMetaAPI(
        phoneNumber, 
        message, 
        orderId, 
        customerName,
        useTemplate,
        templateName,
        templateLanguage
      )
    }

    // Fallback to Twilio (if configured)
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
    const twilioWhatsAppFrom = process.env.TWILIO_WHATSAPP_FROM

    if (twilioAccountSid && twilioAuthToken && twilioWhatsAppFrom) {
      return await sendViaTwilio(phoneNumber, message, orderId, customerName)
    }

    // If no provider is configured, log and return success (don't block payment flow)
    console.warn('WhatsApp API not configured. Message would be sent to:', phoneNumber)
    console.warn('Message content:', message)
    
    return NextResponse.json({
      success: true,
      message: 'WhatsApp API not configured. Message logged for manual sending.',
      phoneNumber,
    })
  } catch (error: any) {
    console.error('WhatsApp message error:', error)
    // Don't fail the payment flow if WhatsApp fails
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send WhatsApp message',
      // Still return 200 to not block payment completion
    }, { status: 200 })
  }
}

async function sendViaTwilio(
  to: string,
  message: string,
  orderId?: string,
  customerName?: string
) {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID!
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN!
  const twilioWhatsAppFrom = process.env.TWILIO_WHATSAPP_FROM!

  // Convert phone to Twilio WhatsApp format
  const whatsappTo = `whatsapp:${to}`

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        From: twilioWhatsAppFrom,
        To: whatsappTo,
        Body: message,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || `Twilio error: ${response.statusText}`)
  }

  return NextResponse.json({
    success: true,
    messageSid: data.sid,
    provider: 'twilio',
  })
}

async function sendViaMetaAPI(
  to: string,
  message: string,
  orderId?: string,
  customerName?: string,
  useTemplate: boolean = false,
  templateName?: string,
  templateLanguage: string = 'en_US'
) {
  // Support both new and legacy variable names
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_API_KEY!
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_BUSINESS_PHONE_ID!

  // Meta WhatsApp Business API endpoint
  // Using v22.0 (latest version) as per Meta's latest API
  const apiUrl = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`

  // Phone number should be without + sign (Meta API format)
  // Also ensure it's just the country code + number (e.g., 919049096801 for +919049096801)
  const phoneNumberWithoutPlus = to.replace(/\+/g, '')
  
  // Log for debugging
  console.log('📱 Sending WhatsApp message:', {
    original: to,
    formatted: phoneNumberWithoutPlus,
    phoneNumberId,
    messageLength: message.length,
  })
  
  // Build request body - support both text messages (immediate) and template messages
  let requestBody: any
  
  if (useTemplate && templateName) {
    // Template message format (for messages after 24 hours or first contact)
    requestBody = {
      messaging_product: 'whatsapp',
      to: phoneNumberWithoutPlus,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: templateLanguage,
        },
      },
    }
  } else {
    // Text message format (for immediate order confirmations within 24 hours)
    // NOTE: Text messages only work within 24-hour customer service window
    // If recipient hasn't messaged you recently, use template messages instead
    requestBody = {
      messaging_product: 'whatsapp',
      to: phoneNumberWithoutPlus,
      type: 'text',
      text: {
        body: message,
      },
    }
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(requestBody),
  })

  const data = await response.json()

  if (!response.ok) {
    // Meta API returns detailed error information
    const errorMessage = data.error?.message || data.error?.error_user_msg || `Meta API error: ${response.statusText}`
    const errorCode = data.error?.code || response.status
    console.error('❌ Meta WhatsApp API Error:', {
      code: errorCode,
      message: errorMessage,
      fullError: data.error,
    })
    throw new Error(`WhatsApp API Error (${errorCode}): ${errorMessage}`)
  }

  // Success response
  console.log('✅ WhatsApp message sent successfully:', {
    messageId: data.messages?.[0]?.id,
    phoneNumber: phoneNumberWithoutPlus,
  })

  return NextResponse.json({
    success: true,
    messageId: data.messages?.[0]?.id,
    provider: 'meta',
    wamid: data.messages?.[0]?.id, // WhatsApp Message ID
    phoneNumber: phoneNumberWithoutPlus, // Include for debugging
    note: 'If message not received, check: 1) Phone number added to test recipients (test mode), 2) 24-hour window (text messages), or 3) Use template messages for first contact',
  })
}
