import { useState, useEffect, useRef } from 'react'
import { useCart } from '../context/CartContext'
import { APP_CONFIG } from '../config/app'

// Self-contained CSS Confetti particles generator
const ConfettiEffect = () => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const colors = ['#007A33', '#FFD700', '#D32F2F', '#FF8C00', '#4CAF50']
    const items = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${2 + Math.random() * 3}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: `${5 + Math.random() * 10}px`,
      tilt: `${Math.random() * 360}deg`
    }))
    setParticles(items)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm animate-confetti-fall"
          style={{
            left: p.left,
            top: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.tilt})`,
            animationDelay: p.delay,
            animationDuration: p.duration
          }}
        />
      ))}
    </div>
  )
}

const CheckoutModal = () => {
  const {
    cartItems,
    isCheckoutOpen,
    checkoutStep,
    paymentMethod,
    isProcessing,
    checkoutError,
    createdOrder,
    studentInfo,
    totalAmount,
    setPaymentMethod,
    setStudentInfo,
    closeCheckout,
    submitOrder,
    executePayment
  } = useCart()

  // 3D Card states
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [upiTimer, setUpiTimer] = useState(300) // 5 minutes in seconds

  // UPI Input
  const [upiIdInput, setUpiIdInput] = useState('')

  // Receipt printable ref
  const receiptRef = useRef()

  // UPI QR Code URL
  const qrCodeUrl = createdOrder 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=007A33&data=${encodeURIComponent(
        `upi://pay?pa=onammitadt@ybl&pn=OnamFestivalMITADT&am=${totalAmount}&tr=${createdOrder.orderNumber}&cu=INR`
      )}`
    : ''

  // Countdown timer for UPI payment
  useEffect(() => {
    if (checkoutStep === 'payment' && paymentMethod === 'upi' && upiTimer > 0) {
      const interval = setInterval(() => {
        setUpiTimer(prev => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [checkoutStep, paymentMethod, upiTimer])

  // Reset timer on order step load
  useEffect(() => {
    if (checkoutStep === 'payment') {
      setUpiTimer(300)
    }
  }, [checkoutStep])

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Format credit card number input (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    value = value.substring(0, 16)
    const matches = value.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '))
    } else {
      setCardNumber(value)
    }
  }

  // Format card expiry input (adds slash MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 4) value = value.substring(0, 4)
    if (value.length > 2) {
      setCardExpiry(`${value.substring(0, 2)}/${value.substring(2)}`)
    } else {
      setCardExpiry(value)
    }
  }

  // Detect card type based on starting digit
  const getCardType = () => {
    if (cardNumber.startsWith('4')) return 'Visa'
    if (cardNumber.startsWith('5')) return 'Mastercard'
    if (cardNumber.startsWith('6')) return 'RuPay'
    return 'Card'
  }

  const handleCvvFocus = () => setIsCardFlipped(true)
  const handleCvvBlur = () => setIsCardFlipped(false)

  // Submit step 1 details
  const handleInfoSubmit = (e) => {
    e.preventDefault()
    // Trigger order creation in backend (step 1)
    submitOrder()
  }

  // Submit step 2 payment
  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    if (paymentMethod === 'upi') {
      executePayment({ upiId: upiIdInput || studentInfo.email })
    } else if (paymentMethod === 'card') {
      executePayment({
        cardDetails: {
          lastFour: cardNumber.slice(-4),
          brand: getCardType()
        }
      })
    }
  }

  // Print invoice receipt
  const printReceipt = () => {
    const style = document.createElement('style')
    style.innerHTML = `
      @media print {
        body { background: white; color: black; padding: 20px; font-family: sans-serif; }
        .no-print { display: none !important; }
        .receipt-container { border: 1px solid #ddd; padding: 24px; border-radius: 8px; }
      }
    `
    document.head.appendChild(style)
    window.print()
    style.remove()
  }

  if (!isCheckoutOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto font-sans" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={checkoutStep !== 'processing' ? closeCheckout : null} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 transform transition-all duration-300 animate-zoom-in max-h-[90vh] flex flex-col">
        {/* Confetti Overlay on Success */}
        {checkoutStep === 'success' && <ConfettiEffect />}

        {/* Steps Header indicator */}
        <div className="bg-gradient-to-r from-onam-green-dark to-onam-green px-6 py-4 flex justify-between items-center text-white flex-shrink-0">
          <div>
            <span className="text-xs uppercase tracking-wider opacity-75 font-semibold">Onam Festival Shopping</span>
            <h3 className="text-lg font-bold">Secure Checkout Checkout</h3>
          </div>
          {checkoutStep !== 'processing' && checkoutStep !== 'success' && (
            <button
              onClick={closeCheckout}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              aria-label="Close checkout modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Progress Tracker Bar */}
        {checkoutStep !== 'success' && (
          <div className="flex bg-gray-50 border-b border-gray-100 py-3 px-6 text-xs font-semibold text-gray-400 flex-shrink-0">
            <div className={`flex items-center space-x-1.5 ${checkoutStep === 'form' ? 'text-onam-green-dark' : 'text-gray-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep === 'form' ? 'bg-onam-green-dark text-white' : 'bg-gray-200'}`}>1</span>
              <span>Student Details</span>
            </div>
            <div className="flex-1 border-t border-dashed border-gray-200 self-center mx-4"></div>
            <div className={`flex items-center space-x-1.5 ${checkoutStep === 'payment' ? 'text-onam-green-dark' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep === 'payment' ? 'bg-onam-green-dark text-white' : 'bg-gray-200'}`}>2</span>
              <span>Payment Details</span>
            </div>
            <div className="flex-1 border-t border-dashed border-gray-200 self-center mx-4"></div>
            <div className={`flex items-center space-x-1.5 ${checkoutStep === 'processing' ? 'text-onam-green-dark' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep === 'processing' ? 'bg-onam-green-dark text-white animate-pulse' : 'bg-gray-200'}`}>3</span>
              <span>Verification</span>
            </div>
          </div>
        )}

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {checkoutError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm font-semibold flex items-start space-x-2.5 animate-shake">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{checkoutError}</span>
            </div>
          )}

          {/* STEP 1: Student Information Form */}
          {checkoutStep === 'form' && (
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase">Total Amount Due</span>
                  <div className="text-2xl font-bold text-onam-green-dark mt-0.5">₹{totalAmount}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Items count</span>
                  <div className="text-sm font-bold text-gray-700 mt-0.5">{cartItems.length} Products</div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-l-4 border-onam-gold-dark pl-2 mb-2">Required Student Info</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5" htmlFor="student-name">Full Name *</label>
                  <input
                    id="student-name"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={studentInfo.name}
                    onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-onam-green-dark focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 transition-all outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5" htmlFor="student-id">Student PRN/ID Number *</label>
                  <input
                    id="student-id"
                    type="text"
                    required
                    placeholder="MITADT2026..."
                    value={studentInfo.studentId}
                    onChange={(e) => setStudentInfo({ ...studentInfo, studentId: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-onam-green-dark focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5" htmlFor="student-email">Email Address *</label>
                  <input
                    id="student-email"
                    type="email"
                    required
                    placeholder="name@mitadt.edu.in"
                    value={studentInfo.email}
                    onChange={(e) => setStudentInfo({ ...studentInfo, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-onam-green-dark focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5" htmlFor="student-phone">WhatsApp Number *</label>
                  <input
                    id="student-phone"
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="10-digit number"
                    value={studentInfo.phone}
                    onChange={(e) => setStudentInfo({ ...studentInfo, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-onam-green-dark focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5" htmlFor="student-course">Course Name *</label>
                  <input
                    id="student-course"
                    type="text"
                    required
                    placeholder="e.g. B.Tech / BBA"
                    value={studentInfo.course}
                    onChange={(e) => setStudentInfo({ ...studentInfo, course: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-onam-green-dark focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5" htmlFor="student-dept">Department/Branch *</label>
                  <input
                    id="student-dept"
                    type="text"
                    required
                    placeholder="e.g. CSE / Aerospace"
                    value={studentInfo.department}
                    onChange={(e) => setStudentInfo({ ...studentInfo, department: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-onam-green-dark focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5" htmlFor="student-year">Academic Year *</label>
                  <select
                    id="student-year"
                    value={studentInfo.year}
                    onChange={(e) => setStudentInfo({ ...studentInfo, year: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-onam-green-dark focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 transition-all outline-none"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5" htmlFor="student-hostel">Hostel Block Name (If Hosteler)</label>
                  <input
                    id="student-hostel"
                    type="text"
                    placeholder="e.g. Raman Hostel"
                    value={studentInfo.hostel}
                    onChange={(e) => setStudentInfo({ ...studentInfo, hostel: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-onam-green-dark focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between space-x-3">
                <button
                  type="button"
                  onClick={closeCheckout}
                  className="px-6 py-3 border border-gray-200 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Return to Cart
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-onam-green-dark hover:bg-onam-green text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Locking Stock & Creating Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Details</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment Gateway Simulation Selector */}
          {checkoutStep === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              {/* Payment Method Selector Tabs */}
              <div className="flex bg-gray-100 rounded-xl p-1 text-sm font-semibold text-gray-500">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 py-2.5 rounded-lg text-center transition-all ${paymentMethod === 'upi' ? 'bg-white text-onam-green-dark shadow-sm' : 'hover:text-gray-800'}`}
                >
                  UPI QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-2.5 rounded-lg text-center transition-all ${paymentMethod === 'card' ? 'bg-white text-onam-green-dark shadow-sm' : 'hover:text-gray-800'}`}
                >
                  Credit/Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 py-2.5 rounded-lg text-center transition-all ${paymentMethod === 'cash' ? 'bg-white text-onam-green-dark shadow-sm' : 'hover:text-gray-800'}`}
                >
                  Cash (On Pickup)
                </button>
              </div>

              {/* TAB 1: UPI Gateway QR Code with Timer */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="text-center space-y-1">
                    <span className="text-xs text-gray-500 font-semibold uppercase">UPI Scan & Pay Gate</span>
                    <h5 className="text-lg font-bold text-gray-800">Scan QR Code via PhonePe, GPay, Paytm</h5>
                    <div className="text-xl font-bold text-onam-green-dark">Amount: ₹{totalAmount}</div>
                  </div>

                  {/* QR Image Box */}
                  <div className="relative p-4 bg-white border border-gray-100 rounded-2xl shadow-md flex items-center justify-center w-[236px] h-[236px]">
                    <img 
                      src={qrCodeUrl} 
                      alt="UPI QR Code Payment intent link" 
                      className="w-full h-full object-contain"
                    />
                    {upiTimer <= 0 && (
                      <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center text-center p-4">
                        <span className="text-red-500 text-sm font-bold">QR Code Expired</span>
                        <p className="text-xs text-gray-500 mt-1">Please close and restart payment session.</p>
                      </div>
                    )}
                  </div>

                  {/* Timer Display */}
                  {upiTimer > 0 ? (
                    <div className="text-sm font-bold text-gray-600 flex items-center space-x-1.5">
                      <svg className="w-4 h-4 text-onam-gold-dark animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Time Remaining: {formatTimer(upiTimer)}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setUpiTimer(300)}
                      className="text-xs font-semibold text-onam-green-dark hover:underline"
                    >
                      Regenerate QR Code
                    </button>
                  )}

                  <div className="w-full space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="upi-id-field">Your UPI ID (For payment confirmation reference) *</label>
                      <input
                        id="upi-id-field"
                        type="text"
                        required
                        placeholder="yourname@okhdfcbank"
                        value={upiIdInput}
                        onChange={(e) => setUpiIdInput(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-onam-green-dark focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 transition-all outline-none"
                      />
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center leading-normal">
                      Scan, make payment, enter your UPI ID above, and click "Simulate Webhook Verification" below to verify transaction status.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: Interactive 3D Credit/Debit Card flip animation */}
              {paymentMethod === 'card' && (
                <div className="space-y-6 flex flex-col items-center">
                  {/* Card 3D container */}
                  <div className="perspective-card w-full max-w-[340px] h-[200px] cursor-pointer">
                    <div className={`card-3d-inner w-full h-full relative transition-transform duration-700 transform ${isCardFlipped ? 'rotate-y-180' : ''}`}>
                      {/* CARD FRONT */}
                      <div className="card-front absolute inset-0 bg-gradient-to-br from-onam-green-dark via-[#094d21] to-[#043314] rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl backface-hidden">
                        {/* Header logo & chip */}
                        <div className="flex justify-between items-start">
                          {/* Chip */}
                          <div className="w-10 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md flex items-center justify-center">
                            <div className="grid grid-cols-2 gap-1 w-6 h-4 opacity-50 border border-black/20"></div>
                          </div>
                          {/* Card Brand */}
                          <span className="font-bold italic text-lg opacity-90">{getCardType()}</span>
                        </div>

                        {/* Card Number display */}
                        <div className="text-lg sm:text-xl font-mono tracking-widest text-center my-3 min-h-[28px]">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>

                        {/* Footer Cardholder + Expiry */}
                        <div className="flex justify-between text-xs font-mono">
                          <div>
                            <span className="block opacity-50 uppercase text-[9px]">Cardholder</span>
                            <span className="font-semibold uppercase tracking-wider">{cardHolder || studentInfo.name || 'Your Name'}</span>
                          </div>
                          <div className="text-right">
                            <span className="block opacity-50 uppercase text-[9px]">Expires</span>
                            <span className="font-semibold">{cardExpiry || 'MM/YY'}</span>
                          </div>
                        </div>
                      </div>

                      {/* CARD BACK */}
                      <div className="card-back absolute inset-0 bg-gradient-to-br from-[#1c1c1c] to-[#0f0f0f] rounded-2xl py-6 text-white flex flex-col justify-between shadow-xl backface-hidden rotate-y-180">
                        {/* Magnetic Strip */}
                        <div className="w-full h-10 bg-black/80 my-2"></div>
                        
                        {/* Signature + CVV */}
                        <div className="px-6 space-y-1.5">
                          <span className="block opacity-40 text-[9px] uppercase font-mono">Authorized CVV Signature</span>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 h-8 bg-white/20 rounded-md stripe-pattern"></div>
                            <div className="bg-white text-gray-900 font-bold px-3 py-1 font-mono rounded-md text-sm">
                              {cardCvv || '•••'}
                            </div>
                          </div>
                        </div>

                        {/* Back footer info */}
                        <div className="px-6 text-[8px] text-gray-500 font-mono text-center">
                          Simulated transaction processing. Powered by bank gateway engine.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Form inputs */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="card-num">Card Number *</label>
                      <input
                        id="card-num"
                        type="text"
                        required
                        placeholder="4000 1234 5678 9010"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-onam-green-dark focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="card-name">Cardholder Name *</label>
                      <input
                        id="card-name"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-onam-green-dark focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 transition-all outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="card-exp">Expiry (MM/YY) *</label>
                        <input
                          id="card-exp"
                          type="text"
                          required
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-onam-green-dark focus:bg-white rounded-xl px-3 py-3 text-sm text-gray-800 transition-all outline-none text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="card-cvv">CVV (3 Digits) *</label>
                        <input
                          id="card-cvv"
                          type="password"
                          required
                          maxLength="3"
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          onFocus={handleCvvFocus}
                          onBlur={handleCvvBlur}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-onam-green-dark focus:bg-white rounded-xl px-3 py-3 text-sm text-gray-800 transition-all outline-none text-center font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Cash on Coupon Delivery instructions */}
              {paymentMethod === 'cash' && (
                <div className="space-y-4 py-4 px-6 border border-onam-gold/20 bg-onam-gold/5 rounded-2xl flex items-start space-x-3.5">
                  <svg className="w-8 h-8 text-onam-gold-dark mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="space-y-1">
                    <h6 className="text-base font-bold text-gray-800">Coupon Code Payment Pickup</h6>
                    <p className="text-sm text-gray-600 leading-normal">
                      We have pre-reserved your order slots! You can pick up the physical coupon cards and make cash payment at the campus festival desk located inside the Main Administrative Block.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-between space-x-3">
                <button
                  type="button"
                  onClick={closeCheckout}
                  className="px-6 py-3 border border-gray-200 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel Order
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || (paymentMethod === 'upi' && upiTimer <= 0)}
                  className="flex-1 bg-onam-green-dark hover:bg-onam-green text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Simulating Verification...</span>
                    </>
                  ) : (
                    <>
                      <span>{paymentMethod === 'cash' ? 'Confirm cash Reservation' : `Simulate payment (₹${totalAmount})`}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Processing loading spinner */}
          {checkoutStep === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 relative flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-onam-green/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-onam-green-dark border-t-transparent rounded-full animate-spin"></div>
                <svg className="w-8 h-8 text-onam-green-dark animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

              <div className="text-center space-y-2 max-w-sm">
                <h5 className="text-lg font-bold text-gray-800 animate-pulse">Contacting Banking Gateway...</h5>
                <p className="text-sm text-gray-500 leading-normal">
                  Securing inventory items, logging database transaction reference, and confirming transaction. Do not refresh or close window.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Success confirmation screen & invoice receipt */}
          {checkoutStep === 'success' && createdOrder && (
            <div className="space-y-6">
              <div className="text-center py-4 space-y-2">
                <div className="w-16 h-16 bg-onam-green-dark/10 rounded-full flex items-center justify-center text-onam-green-dark mx-auto border border-onam-green-dark/20 shadow-inner scale-110">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-gray-800">Order Confirmed!</h4>
                <p className="text-sm text-gray-500">Thank you, {studentInfo.name}. Your booking coupon is registered.</p>
              </div>

              {/* Printable Invoice Receipt */}
              <div ref={receiptRef} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4 receipt-container relative overflow-hidden">
                {/* Visual Watermark */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[140px] font-ornate text-gray-200/20 font-bold pointer-events-none select-none">
                  ONAM
                </div>

                <div className="flex justify-between items-start border-b border-gray-200/60 pb-4">
                  <div>
                    <h5 className="text-md font-bold text-gray-800">MIT ADT Onam Celebrations</h5>
                    <span className="text-xs text-gray-500">Invoice Reference Receipt</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-gray-700">Order No: {createdOrder.orderNumber}</span>
                    <span className="text-xs text-gray-500">{new Date(createdOrder.orderDate || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-gray-400 font-semibold uppercase text-[10px]">Student Info</span>
                    <span className="block font-bold text-gray-700 mt-0.5">{studentInfo.name}</span>
                    <span className="block text-gray-500">{studentInfo.studentId} | {studentInfo.email}</span>
                    <span className="block text-gray-500">{studentInfo.course} ({studentInfo.year})</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-gray-400 font-semibold uppercase text-[10px]">Payment Method</span>
                    <span className="block font-bold text-gray-700 mt-0.5 capitalize">{paymentMethod}</span>
                    <span className="block text-gray-500">Status: {createdOrder.paymentVerificationStatus || 'verified'}</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border-t border-gray-200/60 pt-4">
                  <span className="block text-gray-400 font-semibold uppercase text-[10px] mb-2">Ordered Items</span>
                  <div className="space-y-2">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between text-xs text-gray-600">
                        <span>{item.name} <span className="text-gray-400 font-medium">x{item.quantity}</span></span>
                        <span className="font-bold text-gray-800">₹{item.priceValue * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200/60 pt-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 uppercase">Grand Total Paid</span>
                  <span className="text-lg font-bold text-onam-green-dark">₹{totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons (print invoice, join WhatsApp) */}
              <div className="space-y-3 pt-2">
                {/* Print Button */}
                <button
                  onClick={printReceipt}
                  className="w-full border border-gray-200 hover:border-gray-300 bg-white text-gray-700 font-bold py-3 px-6 rounded-full flex items-center justify-center space-x-2 transition-all duration-200 text-sm no-print"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Download / Print Invoice Receipt</span>
                </button>

                {/* Join WhatsApp Group Button */}
                <a
                  href={APP_CONFIG.COMMUNICATION.WHATSAPP_GROUP_LINK || "https://chat.whatsapp.com/mock-onam-mitadt"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-6 rounded-full flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all duration-200 text-sm no-print"
                >
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.63 2.007 14.162.981 11.54.981 6.11.981 1.69 5.35 1.686 10.779c-.001 1.682.454 3.32 1.317 4.752l-.995 3.635 3.738-.979z" />
                  </svg>
                  <span>Join Official Onam WhatsApp Group</span>
                </a>

                {/* Close Success Modal */}
                <button
                  onClick={closeCheckout}
                  className="w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-700 py-2.5 transition-colors no-print"
                >
                  Done & Close window
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CheckoutModal
