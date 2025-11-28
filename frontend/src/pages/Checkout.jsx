import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { isValidEmail, isValidPhone, isValidUPI, isRequired } from '../utils/validation'
import { parsePrice, formatPrice } from '../utils/price'

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  // Form state - Student information for university event
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    course: '',
    department: '',
    year: '',
    hostel: '',
    paymentMethod: 'cash',
    upiId: '',
    transactionId: ''
  })

  const [errors, setErrors] = useState({})

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }, [errors])

  const validateForm = useCallback(() => {
    const newErrors = {}
    
    // Validate required fields
    if (!isRequired(formData.name)) newErrors.name = 'Full name is required'
    if (!isRequired(formData.studentId)) newErrors.studentId = 'Student ID/Registration Number is required'
    if (!isRequired(formData.email)) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!isRequired(formData.phone)) {
      newErrors.phone = 'Phone number is required'
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }
    if (!isRequired(formData.course)) newErrors.course = 'Course/Program is required'
    if (!isRequired(formData.department)) newErrors.department = 'Department is required'
    if (!isRequired(formData.year)) newErrors.year = 'Year is required'
    
    // UPI validation
    if (formData.paymentMethod === 'upi') {
      if (!isRequired(formData.upiId)) {
        newErrors.upiId = 'UPI ID is required'
      } else if (!isValidUPI(formData.upiId)) {
        newErrors.upiId = 'Invalid UPI ID format (e.g., yourname@paytm)'
      }
      if (!isRequired(formData.transactionId)) {
        newErrors.transactionId = 'Transaction ID is required after payment'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsProcessing(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In a real app, you would send this data to your backend
    console.log('Order placed:', { formData, cartItems, totalPrice })
    
    setIsProcessing(false)
    setOrderPlaced(true)
    clearCart()
    
    // Redirect to home after 3 seconds
    setTimeout(() => {
      navigate('/')
    }, 3000)
  }, [formData, cartItems, totalPrice, validateForm, clearCart, navigate])

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for registering for Onam celebrations at MIT ADT University!
          </p>
          <p className="text-sm text-gray-500 mb-6">
            We'll send you a confirmation email shortly. See you at the event!
          </p>
          <p className="text-xs text-gray-400">
            Redirecting to home page...
          </p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to checkout!</p>
          <button
            onClick={() => navigate('/shopping')}
            className="bg-onam-green text-white font-semibold py-3 px-8 rounded-full hover:bg-green-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 font-heading">Event Registration</h1>
          <p className="text-gray-600">MIT ADT University - Onam Festival 2025</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
              {/* Student Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Student Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-onam-green'
                      }`}
                      placeholder="Enter your full name as per university records"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID / Registration Number *
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.studentId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-onam-green'
                      }`}
                      placeholder="e.g., MITADT2024XXX"
                    />
                    {errors.studentId && <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-onam-green'
                        }`}
                        placeholder="student@mituniversity.edu.in"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        maxLength={10}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-onam-green'
                        }`}
                        placeholder="10-digit mobile number"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Academic Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course / Program *
                      </label>
                      <input
                        type="text"
                        name="course"
                        value={formData.course}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.course ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-onam-green'
                        }`}
                        placeholder="e.g., B.Tech, MBA, BBA"
                      />
                      {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department *
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.department ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-onam-green'
                        }`}
                        placeholder="e.g., Computer Science, Mechanical"
                      />
                      {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year *
                      </label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.year ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-onam-green'
                        }`}
                      >
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Post Graduate">Post Graduate</option>
                      </select>
                      {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hostel / Block (Optional)
                      </label>
                      <input
                        type="text"
                        name="hostel"
                        value={formData.hostel}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-onam-green"
                        placeholder="e.g., Hostel A, Block 3"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {/* Cash Payment Option */}
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: formData.paymentMethod === 'cash' ? '#D97706' : '#E5E7EB' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">💵</span>
                        <div>
                          <span className="font-medium block">Cash Payment</span>
                          <span className="text-sm text-gray-600">Pay at the event venue</span>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* UPI Payment Option */}
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: formData.paymentMethod === 'upi' ? '#D97706' : '#E5E7EB' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">📱</span>
                        <div>
                          <span className="font-medium block">UPI Payment</span>
                          <span className="text-sm text-gray-600">Pay via UPI (PhonePe, Google Pay, Paytm)</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* UPI Payment Details */}
                {formData.paymentMethod === 'upi' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-300">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-800">Pay to UPI ID:</span>
                        <span className="text-lg font-bold text-onam-green">8955142954-2@ybl</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• Scan QR code or use UPI ID: <span className="font-mono font-semibold">8955142954-2@ybl</span></p>
                        <p>• Amount: <span className="font-bold text-onam-green">{formatPrice(totalPrice)}</span></p>
                        <p>• After payment, enter your UPI ID and Transaction ID below</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your UPI ID *
                      </label>
                      <input
                        type="text"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.upiId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-onam-green'
                        }`}
                        placeholder="yourname@paytm or yourname@ybl"
                      />
                      {errors.upiId && <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction ID / UPI Reference Number *
                      </label>
                      <input
                        type="text"
                        name="transactionId"
                        value={formData.transactionId}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.transactionId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-onam-green'
                        }`}
                        placeholder="Enter transaction ID from payment app"
                      />
                      {errors.transactionId && <p className="text-red-500 text-sm mt-1">{errors.transactionId}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        You can find this in your payment app after successful payment
                      </p>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'cash' && (
                  <p className="text-sm text-gray-500 mt-3">
                    * Payment will be collected at the event venue on the day of the celebration.
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm text-gray-700">
                    I confirm that all the information provided is correct and I agree to participate in the Onam Festival celebrations at MIT ADT University.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-onam-gold text-white font-semibold py-3 px-6 rounded-full hover:bg-amber-600 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Registration...
                  </span>
                ) : (
                  'Confirm Registration'
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Registration Summary</h2>
              <p className="text-sm text-gray-600 mb-4">Items selected for Onam Festival</p>
              
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => {
                  const price = item.priceValue || parsePrice(item.price, 0)
                  const itemTotal = price * (item.quantity || 1)
                  
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {formatPrice(itemTotal)}
                      </span>
                    </div>
                  )
                })}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-onam-green">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

