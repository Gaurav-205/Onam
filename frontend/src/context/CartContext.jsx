/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createOrder, processPayment, fetchProducts } from '../config/api'
import { APP_CONFIG } from '../config/app'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  // Load initial cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(APP_CONFIG.CART.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [products, setProducts] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState('form') // 'form', 'payment', 'processing', 'success'
  const [paymentMethod, setPaymentMethod] = useState('upi') // 'upi', 'card', 'cash'
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)
  const [createdOrder, setCreatedOrder] = useState(null)
  const [idempotencyKey, setIdempotencyKey] = useState(null)

  const [studentInfo, setStudentInfo] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    course: '',
    department: '',
    year: '1st Year',
    hostel: ''
  })

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem(APP_CONFIG.CART.STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  // Fetch product inventory from backend
  const refreshInventory = useCallback(async () => {
    try {
      const data = await fetchProducts()
      if (data.success && data.products) {
        setProducts(data.products)
      }
    } catch (err) {
      console.error('Failed to fetch product stocks:', err)
    }
  }, [])

  // Load products inventory on mount
  useEffect(() => {
    refreshInventory()
  }, [refreshInventory])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  const addToCart = useCallback((item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id 
          ? { ...i, quantity: Math.min(i.quantity + 1, APP_CONFIG.CART.MAX_QUANTITY) } 
          : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    setIsCartOpen(true)
  }, [])

  const removeFromCart = useCallback((id) => {
    setCartItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCartItems(prev => prev.map(i => i.id === id 
      ? { ...i, quantity: Math.min(quantity, APP_CONFIG.CART.MAX_QUANTITY) } 
      : i
    ))
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCartItems([])
    localStorage.removeItem(APP_CONFIG.CART.STORAGE_KEY)
  }, [])

  const startCheckout = useCallback(async () => {
    setCheckoutError(null)
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
    setCheckoutStep('form')
    
    // Fetch fresh stock status before user completes checkout
    await refreshInventory()

    // Generate unique idempotency key for this checkout session
    setIdempotencyKey(crypto.randomUUID())
  }, [refreshInventory])

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false)
    setIsProcessing(false)
    setCheckoutError(null)
  }, [])

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.priceValue * item.quantity), 0)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Submit checkout order to backend (Step 1 of Payment/Order workflow)
  const submitOrder = async (e) => {
    if (e) e.preventDefault()
    setIsProcessing(true)
    setCheckoutError(null)

    // Dynamic stock validation on client-side first
    for (const item of cartItems) {
      const dbProd = products.find(p => p.productId === item.id)
      if (dbProd && dbProd.stock < item.quantity) {
        setCheckoutError(`Insufficient stock for ${item.name}. Available: ${dbProd.stock}, Requested: ${item.quantity}. Please adjust your cart.`)
        setIsProcessing(false)
        return
      }
    }

    try {
      const orderPayload = {
        studentInfo,
        orderItems: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.priceValue,
          quantity: item.quantity,
          total: item.priceValue * item.quantity
        })),
        payment: {
          method: paymentMethod,
          verificationStatus: paymentMethod === 'cash' ? 'unverified' : 'pending'
        },
        totalAmount,
        idempotencyKey
      }

      const response = await createOrder(orderPayload, idempotencyKey)
      
      if (response.success && response.order) {
        setCreatedOrder(response.order)
        
        if (paymentMethod === 'cash') {
          // Cash is resolved instantly as a pending pickup order
          setCheckoutStep('success')
          clearCart()
        } else {
          // UPI or Card requires going to the payment details screen
          setCheckoutStep('payment')
        }
      } else {
        setCheckoutError(response.message || 'Failed to create order')
      }
    } catch (error) {
      console.error('Order creation error:', error)
      setCheckoutError(error.message || 'An error occurred during order creation')
    } finally {
      setIsProcessing(false)
    }
  }

  // Process gateway payment simulation (Step 2 of Payment/Order workflow)
  const executePayment = async (paymentDetails = {}) => {
    if (!createdOrder) return
    setIsProcessing(true)
    setCheckoutError(null)
    setCheckoutStep('processing')

    try {
      const paymentPayload = {
        orderId: createdOrder.orderId,
        paymentMethod,
        upiId: paymentDetails.upiId || studentInfo.email,
        cardDetails: paymentDetails.cardDetails || null
      }

      const response = await processPayment(paymentPayload)

      if (response.success && response.transaction) {
        // Update local status of created order
        setCreatedOrder(prev => ({
          ...prev,
          status: response.transaction.status,
          paymentVerificationStatus: response.transaction.verificationStatus
        }))
        setCheckoutStep('success')
        clearCart()
        refreshInventory() // Refresh stock levels after successful deduction
      } else {
        setCheckoutError(response.message || 'Payment processing failed')
        setCheckoutStep('payment')
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      setCheckoutError(error.message || 'An error occurred while processing payment')
      setCheckoutStep('payment')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        products,
        isCartOpen,
        isCheckoutOpen,
        checkoutStep,
        paymentMethod,
        isProcessing,
        checkoutError,
        createdOrder,
        studentInfo,
        totalAmount,
        totalItems,
        setPaymentMethod,
        setStudentInfo,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        startCheckout,
        closeCheckout,
        submitOrder,
        executePayment,
        refreshInventory
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
