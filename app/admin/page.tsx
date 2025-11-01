'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, Users, ShoppingBag, DollarSign, Package, Clock, CheckCircle, XCircle, Search, Filter, Calendar, Phone, Mail, MapPin, RefreshCw } from 'lucide-react'

interface Order {
  id: string
  user_id: string | null
  order_id: string
  product_name: string
  quantity: number
  price: number
  total: number
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  created_at: string
  payment_method: string
  address?: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
}

interface Transaction {
  id: string
  user_id: string | null
  transaction_id: string
  order_id: string
  amount: number
  status: 'success' | 'pending' | 'failed'
  created_at: string
  payment_method: string
  guest_email?: string
  guest_phone?: string
}

const ADMIN_PASSWORD = 'Netsky4933#'

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [refreshing, setRefreshing] = useState(false)

  // Check if already authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = sessionStorage.getItem('admin_auth')
      if (authStatus === 'authenticated') {
        setIsAuthenticated(true)
        loadData()
      }
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin_auth', 'authenticated')
      }
      loadData()
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
    setOrders([])
    setTransactions([])
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_auth')
    }
  }

  const loadData = async () => {
    setLoading(true)
    setRefreshing(true)
    
    try {
      // Load all orders and transactions via admin API route
      const response = await fetch(`/api/admin/orders?password=${encodeURIComponent(ADMIN_PASSWORD)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Error loading data:', error)
        alert(`Error loading data: ${error.error || 'Unknown error'}`)
        return
      }

      const data = await response.json()
      setOrders(data.orders || [])
      setTransactions(data.transactions || [])
    } catch (error: any) {
      console.error('Error loading data:', error)
      alert(`Error loading data: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': ADMIN_PASSWORD,
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error updating order: ${error.error || 'Unknown error'}`)
        return
      }

      // Reload data
      loadData()
    } catch (error: any) {
      alert(`Error updating order: ${error.message}`)
    }
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.guest_phone?.includes(searchTerm) ||
      order.guest_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Statistics
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
    deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: transactions.filter(t => t.status === 'success').reduce((sum, t) => sum + t.amount, 0),
    totalCustomers: new Set(orders.map(o => o.user_id || o.guest_phone)).size,
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-700 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-navy-900 mb-2">Admin Dashboard</h1>
            <p className="text-navy-600">Enter password to access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-navy-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700"
                placeholder="Enter admin password"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-600 hover:to-navy-800 text-white py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen bg-beige-50 pt-16 sm:pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-navy-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-navy-700 hover:bg-navy-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-lg border border-navy-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-navy-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{stats.totalOrders}</p>
                <p className="text-xs text-navy-600">Total Orders</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 shadow-lg border border-navy-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{stats.pendingOrders}</p>
                <p className="text-xs text-navy-600">Pending</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 shadow-lg border border-navy-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{stats.deliveredOrders}</p>
                <p className="text-xs text-navy-600">Delivered</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 shadow-lg border border-navy-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                <p className="text-xs text-navy-600">Revenue</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-lg border border-navy-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders, customers, phone, email..."
                className="w-full pl-10 pr-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-navy-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading && !refreshing ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-700 mb-4"></div>
            <p className="text-navy-700">Loading orders...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-navy-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy-50 border-b border-navy-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-navy-700 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-navy-700 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-navy-700 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-navy-700 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-navy-700 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-navy-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-navy-700 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-navy-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filteredOrders.map((order) => {
                    const transaction = transactions.find(t => t.order_id === order.order_id)
                    const statusColors = {
                      pending: 'bg-yellow-100 text-yellow-800',
                      confirmed: 'bg-blue-100 text-blue-800',
                      delivered: 'bg-green-100 text-green-800',
                      cancelled: 'bg-red-100 text-red-800',
                    }
                    
                    return (
                      <tr key={order.id} className="hover:bg-navy-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-navy-900">{order.order_id}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="space-y-1">
                            <div className="font-semibold text-navy-900">
                              {order.guest_name || 'User Account'}
                            </div>
                            {order.guest_phone && (
                              <div className="text-navy-600 text-xs flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {order.guest_phone}
                              </div>
                            )}
                            {order.guest_email && (
                              <div className="text-navy-600 text-xs flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {order.guest_email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-navy-900">{order.product_name}</td>
                        <td className="px-4 py-3 text-sm text-navy-900">{order.quantity}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-navy-900">₹{order.total.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-navy-600">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="text-xs px-2 py-1 border border-navy-300 rounded focus:outline-none focus:ring-2 focus:ring-navy-700"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-12 text-navy-600">
                  No orders found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Details Modal - can be expanded later */}
        {filteredOrders.length > 0 && (
          <div className="mt-6 text-sm text-navy-600 text-center">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        )}
      </div>
    </div>
  )
}
