'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, Package, Search, X } from 'lucide-react'
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
  final_status?: 'Order Packed' | 'Order Shipped' | 'Order Delivered' | null
}

type PaymentStatus = 'Paid' | 'Cart Abandoned' | 'Payment Failed'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const [finalStatusFilter, setFinalStatusFilter] = useState<string>('all')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

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

  // Determine payment status based on order and transaction data
  const getPaymentStatus = (order: Order): PaymentStatus => {
    // Paid: transaction success OR COD with confirmed status
    if (
      order.transaction_status === 'success' ||
      (order.payment_method === 'Cash on Delivery' && order.status === 'confirmed')
    ) {
      return 'Paid'
    }
    
    // Payment Failed: transaction failed OR cancelled status
    if (order.transaction_status === 'failed' || order.status === 'cancelled') {
      return 'Payment Failed'
    }
    
    // Cart Abandoned: pending status with no transaction or pending transaction
    if (order.status === 'pending' && (!order.transaction_status || order.transaction_status === 'pending')) {
      return 'Cart Abandoned'
    }
    
    // Default to Cart Abandoned for safety
    return 'Cart Abandoned'
  }

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    let filtered = orders

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order => 
        order.order_id.toLowerCase().includes(query) ||
        order.guest_name?.toLowerCase().includes(query) ||
        order.guest_email?.toLowerCase().includes(query) ||
        order.guest_phone?.toLowerCase().includes(query) ||
        order.address?.toLowerCase().includes(query) ||
        order.product_name.toLowerCase().includes(query)
      )
    }

    // Payment status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => getPaymentStatus(order) === statusFilter)
    }

    // Final status filter
    if (finalStatusFilter !== 'all') {
      if (finalStatusFilter === 'none') {
        filtered = filtered.filter(order => !order.final_status)
      } else {
        filtered = filtered.filter(order => order.final_status === finalStatusFilter)
      }
    }

    return filtered
  }, [orders, searchQuery, statusFilter, finalStatusFilter])

  const updateFinalStatus = async (orderId: string, finalStatus: string | null) => {
    try {
      setUpdatingOrderId(orderId)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ final_status: finalStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.order_id === orderId
            ? { ...order, final_status: finalStatus as any }
            : order
        )
      )
    } catch (err: any) {
      console.error('Error updating final status:', err)
      alert('Failed to update order status. Please try again.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Payment Failed':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'Cart Abandoned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const stats = {
    total: orders.length,
    paid: orders.filter(o => getPaymentStatus(o) === 'Paid').length,
    abandoned: orders.filter(o => getPaymentStatus(o) === 'Cart Abandoned').length,
    failed: orders.filter(o => getPaymentStatus(o) === 'Payment Failed').length,
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-navy-200">
              <div className="text-2xl font-bold text-navy-900">{stats.total}</div>
              <div className="text-sm text-navy-600">Total Orders</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-navy-200">
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
              <div className="text-sm text-navy-600">Paid</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-navy-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.abandoned}</div>
              <div className="text-sm text-navy-600">Abandoned</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-navy-200">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-navy-600">Failed</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Name, Email, Phone, Address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-navy-400 hover:text-navy-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Payment Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
              className="px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
            >
              <option value="all">All Payment Status</option>
              <option value="Paid">Paid</option>
              <option value="Cart Abandoned">Cart Abandoned</option>
              <option value="Payment Failed">Payment Failed</option>
            </select>

            {/* Final Status Filter */}
            <select
              value={finalStatusFilter}
              onChange={(e) => setFinalStatusFilter(e.target.value)}
              className="px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
            >
              <option value="all">All Final Status</option>
              <option value="none">No Status</option>
              <option value="Order Packed">Order Packed</option>
              <option value="Order Shipped">Order Shipped</option>
              <option value="Order Delivered">Order Delivered</option>
            </select>
          </div>
        </motion.div>

        {/* Orders Table */}
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
          <div className="bg-white rounded-lg border border-navy-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy-50 border-b border-navy-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-navy-900 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-navy-900 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-navy-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-navy-900 uppercase tracking-wider">
                      Final Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-navy-200">
                  {filteredOrders.map((order, index) => {
                    const paymentStatus = getPaymentStatus(order)
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-beige-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-navy-900 font-mono">
                          {order.order_id}
                        </td>
                        <td className="px-4 py-3 text-sm text-navy-700">
                          {order.guest_name || 'Logged-in User'}
                        </td>
                        <td className="px-4 py-3 text-sm text-navy-700">
                          {order.guest_email || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-navy-700">
                          {order.guest_phone || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-navy-700 max-w-xs">
                          <div className="truncate" title={order.address || '-'}>
                            {order.address || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-navy-700 text-center">
                          {order.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-navy-900 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IndianRupee className="w-4 h-4" />
                            {order.total}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusColor(paymentStatus)}`}>
                            {paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={order.final_status || ''}
                            onChange={(e) => updateFinalStatus(order.order_id, e.target.value || null)}
                            disabled={updatingOrderId === order.order_id}
                            className="text-xs px-2 py-1 border border-navy-300 rounded focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">-</option>
                            <option value="Order Packed">Order Packed</option>
                            <option value="Order Shipped">Order Shipped</option>
                            <option value="Order Delivered">Order Delivered</option>
                          </select>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-navy-50 px-4 py-3 border-t border-navy-200">
              <p className="text-sm text-navy-600 text-center">
                Showing {filteredOrders.length} of {orders.length} orders
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
