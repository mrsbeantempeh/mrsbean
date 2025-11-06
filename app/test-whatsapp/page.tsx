'use client'

import { useState } from 'react'

export default function TestWhatsApp() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testPhoneNumber = '9049096801'
  const testMessage = `🧪 Test Message from Mrs Bean

This is a test WhatsApp message to verify the integration.

✅ If you receive this, the WhatsApp API is working correctly!

Order Details:
📦 Test Order ID: TEST-${Date.now()}
💰 Amount: ₹125
📊 Quantity: 1x Fresh Tempeh

Thank you for testing! ❤️`

  const handleTest = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/whatsapp/send-message', {
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
      
      if (response.ok && data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to send message')
      }
    } catch (err: any) {
      setError(err.message || 'Error sending message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-navy-900 mb-6 text-center">
          WhatsApp API Test
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-1">
              Test Phone Number
            </label>
            <input
              type="text"
              value={testPhoneNumber}
              readOnly
              className="w-full px-4 py-2 border border-navy-300 rounded-lg bg-navy-50 text-navy-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-1">
              Test Message
            </label>
            <textarea
              value={testMessage}
              readOnly
              rows={12}
              className="w-full px-4 py-2 border border-navy-300 rounded-lg bg-navy-50 text-navy-900 text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleTest}
          disabled={loading}
          className="w-full bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-600 hover:to-navy-800 text-white py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : '📤 Send Test WhatsApp Message'}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-bold text-green-800 mb-2">✅ Success!</h3>
            <pre className="text-xs text-green-700 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
            <p className="text-sm text-green-700 mt-2">
              Check WhatsApp for {testPhoneNumber}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-bold text-red-800 mb-2">❌ Error</h3>
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-xs text-red-600 mt-2">
              Check server logs for more details. Make sure META_WHATSAPP_ACCESS_TOKEN and META_WHATSAPP_PHONE_NUMBER_ID are set in .env.local
            </p>
          </div>
        )}

        <div className="mt-6 text-xs text-navy-600 text-center">
          Make sure your development server is running and environment variables are set.
        </div>
      </div>
    </div>
  )
}

