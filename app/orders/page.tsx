'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, Package, CheckCircle, XCircle, Clock, MapPin, Phone, Mail, User } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  order_id: string
  user_id: string | null
  product_name: string
  quantity: number
  price: number
  total: number
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  payment_method: string
  address?: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  created_at: string
  transaction_status?: 'success' | 'pending' | 'failed' | null
  transaction_id?: string | null
  payment_id?: string | null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled'>('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'delivered':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'delivered':
        return <Package className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <div className="min-h-screen bg-beige-50 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-2">All Orders</h1>
              <p className="text-navy-700">View and manage all customer orders</p>
            </div>
            <Link
              href="/products"
              className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
            >
              Back to Products
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-navy-200">
              <div className="text-2xl font-bold text-navy-900">{stats.total}</div>
              <div className="text-sm text-navy-600">Total Orders</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-navy-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-navy-600">Pending</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-navy-200">
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-sm text-navy-600">Confirmed</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-navy-200">
              <div className="text-2xl font-bold text-blue-600">{stats.delivered}</div>
              <div className="text-sm text-navy-600">Delivered</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-navy-200">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-navy-600">Cancelled</div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'confirmed', 'delivered', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-navy-900 text-white'
                    : 'bg-white text-navy-700 border border-navy-200 hover:bg-navy-50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="mt-4 text-navy-700">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold">Error: {error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-navy-200">
            <Package className="w-16 h-16 text-navy-300 mx-auto mb-4" />
            <p className="text-navy-700 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg border border-navy-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-navy-900 mb-1">
                          {order.product_name}
                        </h3>
                        <p className="text-sm text-navy-600">Order ID: {order.order_id}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium capitalize">{order.status}</span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <User className="w-5 h-5 text-navy-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-navy-900">Customer</p>
                          <p className="text-sm text-navy-700">
                            {order.guest_name || 'Logged-in User'}
                          </p>
                        </div>
                      </div>
                      {order.guest_phone && (
                        <div className="flex items-start gap-2">
                          <Phone className="w-5 h-5 text-navy-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-navy-900">Phone</p>
                            <p className="text-sm text-navy-700">{order.guest_phone}</p>
                          </div>
                        </div>
                      )}
                      {order.guest_email && (
                        <div className="flex items-start gap-2">
                          <Mail className="w-5 h-5 text-navy-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-navy-900">Email</p>
                            <p className="text-sm text-navy-700 break-all">{order.guest_email}</p>
                          </div>
                        </div>
                      )}
                      {order.address && (
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <MapPin className="w-5 h-5 text-navy-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-navy-900">Delivery Address</p>
                            <p className="text-sm text-navy-700">{order.address}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-navy-700">
                      <span>Quantity: <strong>{order.quantity}</strong></span>
                      <span>Price: <strong>₹{order.price}</strong></span>
                      <span>Payment: <strong>{order.payment_method}</strong></span>
                      {order.transaction_status && (
                        <span className={`px-2 py-1 rounded ${
                          order.transaction_status === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : order.transaction_status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          Payment: {order.transaction_status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Total & Date */}
                  <div className="lg:text-right">
                    <div className="mb-2">
                      <div className="text-2xl font-bold text-navy-900 flex items-center gap-1 lg:justify-end">
                        <IndianRupee className="w-6 h-6" />
                        {order.total}
                      </div>
                      <p className="text-sm text-navy-600 mt-1">{formatDate(order.created_at)}</p>
                    </div>
                    {order.payment_id && (
                      <p className="text-xs text-navy-500 mt-2">
                        Payment ID: {order.payment_id.slice(0, 12)}...
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

