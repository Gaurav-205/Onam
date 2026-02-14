import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { parsePrice } from '../utils/price'
import { APP_CONFIG } from '../config/app'

const CartContext = createContext()

/* eslint-disable react-refresh/only-export-components */
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('onam_cart')
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          // Validate parsed data is an array
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart)
          } else {
            // Invalid data format - clear it
            localStorage.removeItem('onam_cart')
          }
        } catch (parseError) {
          // Clear corrupted cart data
          localStorage.removeItem('onam_cart')
        }
      }
    } catch (storageError) {
      // localStorage not available or blocked - cart will work in memory only
    }
  }, [])

  // Save cart to localStorage whenever it changes (with error handling)
  useEffect(() => {
    try {
      localStorage.setItem('onam_cart', JSON.stringify(cartItems))
    } catch (storageError) {
      // Handle quota exceeded or other localStorage errors silently
      // Cart will still work in memory, just won't persist
      // Only log in development
      if (import.meta.env.MODE === 'development') {
        // eslint-disable-next-line no-console
        console.warn('Failed to save cart to localStorage:', storageError.name)
      }
    }
  }, [cartItems])

  // Add item to cart
  const addToCart = useCallback((product) => {
    // Validate product before adding
    if (!product || !product.id) {
      // Silent fail - invalid product
      return
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id)
      
      if (existingItem) {
        // If item exists, increase quantity (with max limit)
        const maxQuantity = APP_CONFIG?.CART?.MAX_QUANTITY || 99
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min((item.quantity || 1) + 1, maxQuantity) }
            : item
        )
      } else {
        // If item doesn't exist, add it with quantity 1
        return [...prevItems, { ...product, quantity: 1 }]
      }
    })
  }, [])

  // Remove item from cart
  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId))
  }, [])

  // Update item quantity
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    )
  }, [removeFromCart])

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  // Calculate total items in cart
  const totalItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }, [cartItems])

  // Calculate total price with error handling
  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = item.priceValue || parsePrice(item.price, 0)
      const quantity = item.quantity || 1
      return total + (price * quantity)
    }, 0)
  }, [cartItems])

  // Check if item is in cart
  const isInCart = useCallback((productId) => {
    return cartItems.some(item => item.id === productId)
  }, [cartItems])

  // Get item quantity in cart
  const getItemQuantity = useCallback((productId) => {
    const item = cartItems.find(item => item.id === productId)
    return item ? item.quantity : 0
  }, [cartItems])

  // Memoize context value - callbacks are already memoized so only depend on cartItems and computed values
  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isInCart,
    getItemQuantity
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, isInCart, getItemQuantity])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

