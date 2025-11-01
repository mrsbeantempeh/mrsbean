'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  Lock,
  ShoppingBag,
  CreditCard,
  Settings,
  LogOut,
  Edit,
  Check,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountDashboard />
    </ProtectedRoute>
  )
}

function AccountDashboard() {
  const { user, profile, orders, transactions, logout, updateProfile, changePassword, changeEmail, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'transactions' | 'settings'>('profile')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
  })
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: '',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Sync profile data when profile loads
  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || '',
        phone: profile.phone || '',
      })
    }
  }, [profile])

  const handleUpdateProfile = async () => {
    setErrors({})
    setIsLoading(true)

    try {
      const result = await updateProfile(profileData)
      if (result.success) {
        setIsEditing(false)
      } else {
        setErrors({ submit: result.error || 'Failed to update profile' })
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Something went wrong' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setErrors({})
    
    if (passwordData.newPassword.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' })
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    setIsLoading(true)

    try {
      const result = await changePassword(passwordData.newPassword)
      if (result.success) {
        setIsChangingPassword(false)
        setPasswordData({ newPassword: '', confirmPassword: '' })
      } else {
        setErrors({ submit: result.error || 'Failed to change password' })
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Something went wrong' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangeEmail = async () => {
    setErrors({})
    
    if (!/\S+@\S+\.\S+/.test(emailData.newEmail)) {
      setErrors({ email: 'Invalid email address' })
      return
    }

    setIsLoading(true)

    try {
      const result = await changeEmail(emailData.newEmail)
      if (result.success) {
        setIsChangingEmail(false)
        setEmailData({ newEmail: '', password: '' })
      } else {
        setErrors({ submit: result.error || 'Failed to change email' })
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Something went wrong' })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while auth is loading
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-beige-50 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 md:pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-700 mb-4"></div>
          <p className="text-navy-700">Loading account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-beige-50 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 md:pb-16">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/" className="inline-block mb-6">
            <div className="relative w-32 h-12">
              <Image
                src="/mrsbeanlogo.jpeg"
                alt="Mrs Bean Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-2">My Account</h1>
          <p className="text-navy-700">Manage your profile, orders, and settings</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-navy-100">
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 sm:gap-2">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'orders', label: 'Orders', icon: ShoppingBag },
                  { id: 'transactions', label: 'Transactions', icon: CreditCard },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                        activeTab === tab.id
                          ? 'bg-navy-700 text-white'
                          : 'text-navy-700 hover:bg-navy-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
                
                <button
                  onClick={async () => {
                    setIsLoggingOut(true)
                    await logout()
                  }}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-red-600 hover:bg-red-50 mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoggingOut ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></span>
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-navy-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-navy-900">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateProfile}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setProfileData({
                            name: profile?.name || '',
                            phone: profile?.phone || '',
                          })
                          setErrors({})
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {errors.submit && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {errors.submit}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-beige-50 rounded-lg text-navy-900">
                        {profile?.name || 'Not set'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">
                      Email Address
                    </label>
                    <div className="px-4 py-3 bg-beige-50 rounded-lg text-navy-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-navy-600" />
                      {user?.email || profile?.email || 'Not set'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700"
                        placeholder="+91 98765 43210"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-beige-50 rounded-lg text-navy-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-navy-600" />
                        {profile?.phone || 'Not set'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">
                      Member Since
                    </label>
                    <div className="px-4 py-3 bg-beige-50 rounded-lg text-navy-900">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Not available'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div
                className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-navy-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-navy-900 mb-6">Order History</h2>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-navy-300 mx-auto mb-4" />
                    <p className="text-navy-700 text-lg mb-2">No orders yet</p>
                    <p className="text-navy-600 mb-6">Start shopping to see your orders here</p>
                    <Link
                      href="/products"
                      className="inline-block px-6 py-3 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-navy-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-navy-900 text-lg mb-1">{order.product_name}</h3>
                            <p className="text-sm text-navy-600">Order ID: {order.order_id}</p>
                          </div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 sm:mt-0 ${
                              order.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-navy-600 mb-1">Quantity</p>
                            <p className="font-semibold text-navy-900">{order.quantity}</p>
                          </div>
                          <div>
                            <p className="text-navy-600 mb-1">Price</p>
                            <p className="font-semibold text-navy-900">₹{order.price}</p>
                          </div>
                          <div>
                            <p className="text-navy-600 mb-1">Total</p>
                            <p className="font-semibold text-navy-900">₹{order.total}</p>
                          </div>
                          <div>
                            <p className="text-navy-600 mb-1">Date</p>
                            <p className="font-semibold text-navy-900">
                              {new Date(order.created_at).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <motion.div
                className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-navy-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-navy-900 mb-6">Transaction History</h2>
                
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-navy-300 mx-auto mb-4" />
                    <p className="text-navy-700 text-lg mb-2">No transactions yet</p>
                    <p className="text-navy-600">Your payment transactions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="border border-navy-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                          <div>
                            <p className="font-semibold text-navy-900 mb-1">
                              Transaction ID: {transaction.transaction_id}
                            </p>
                            <p className="text-sm text-navy-600">Order ID: {transaction.order_id}</p>
                          </div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 sm:mt-0 ${
                              transaction.status === 'success'
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-navy-600 mb-1">Amount</p>
                            <p className="font-semibold text-navy-900">₹{transaction.amount}</p>
                          </div>
                          <div>
                            <p className="text-navy-600 mb-1">Payment Method</p>
                            <p className="font-semibold text-navy-900">{transaction.payment_method}</p>
                          </div>
                          <div>
                            <p className="text-navy-600 mb-1">Date</p>
                            <p className="font-semibold text-navy-900">
                              {new Date(transaction.created_at).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-navy-100 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-navy-900">Settings</h2>

                {/* Change Password */}
                <div className="border border-navy-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-navy-700" />
                      <h3 className="text-lg font-semibold text-navy-900">Change Password</h3>
                    </div>
                    {!isChangingPassword && (
                      <button
                        onClick={() => setIsChangingPassword(true)}
                        className="px-4 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors text-sm"
                      >
                        Change
                      </button>
                    )}
                  </div>

                  {isChangingPassword && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700"
                          placeholder="Enter new password"
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700"
                          placeholder="Confirm new password"
                        />
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                        )}
                      </div>
                      {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                          {errors.submit}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={handleChangePassword}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Save Password
                        </button>
                        <button
                          onClick={() => {
                            setIsChangingPassword(false)
                            setPasswordData({ newPassword: '', confirmPassword: '' })
                            setErrors({})
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Change Email */}
                <div className="border border-navy-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-navy-700" />
                      <h3 className="text-lg font-semibold text-navy-900">Change Email</h3>
                    </div>
                    {!isChangingEmail && (
                      <button
                        onClick={() => setIsChangingEmail(true)}
                        className="px-4 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors text-sm"
                      >
                        Change
                      </button>
                    )}
                  </div>

                  {isChangingEmail && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">
                          Current Email
                        </label>
                        <div className="px-4 py-3 bg-beige-50 rounded-lg text-navy-900">
                          {user?.email || profile?.email}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">
                          New Email Address
                        </label>
                        <input
                          type="email"
                          value={emailData.newEmail}
                          onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                          className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700"
                          placeholder="Enter new email"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                      </div>
                      {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                          {errors.submit}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={handleChangeEmail}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Save Email
                        </button>
                        <button
                          onClick={() => {
                            setIsChangingEmail(false)
                            setEmailData({ newEmail: '', password: '' })
                            setErrors({})
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

