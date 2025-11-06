/**
 * Test script for WhatsApp message sending
 * 
 * Usage: npx tsx test-whatsapp.ts
 */

async function testWhatsAppMessage() {
  const testPhoneNumber = '9049096801'
  const testMessage = `🧪 Test Message from Mrs Bean

This is a test WhatsApp message to verify the integration.

✅ If you receive this, the WhatsApp API is working correctly!

Order Details:
📦 Test Order ID: TEST-${Date.now()}
💰 Amount: ₹125
📊 Quantity: 1x Fresh Tempeh

Thank you for testing! ❤️`

  try {
    console.log('📤 Sending test WhatsApp message...')
    console.log('📱 To:', testPhoneNumber)
    console.log('---')

    const response = await fetch('http://localhost:3000/api/whatsapp/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: testPhoneNumber,
        message: testMessage,
        orderId: `TEST-${Date.now()}`,
        customerName: 'Test Customer',
      }),
    })

    const data = await response.json()

    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(data, null, 2))

    if (response.ok && data.success) {
      console.log('---')
      console.log('✅ SUCCESS! Message sent successfully!')
      console.log('📱 Check WhatsApp for:', testPhoneNumber)
      if (data.messageId || data.wamid) {
        console.log('📝 Message ID:', data.messageId || data.wamid)
      }
    } else {
      console.log('---')
      console.log('❌ FAILED! Message not sent.')
      if (data.error) {
        console.log('❌ Error:', data.error)
      }
    }
  } catch (error: any) {
    console.error('❌ Error sending message:', error.message)
    console.error('Full error:', error)
  }
}

// Run test
testWhatsAppMessage()

