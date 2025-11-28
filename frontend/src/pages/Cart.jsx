import { useCallback, memo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { parsePrice, formatPrice } from '../utils/price'

// Memoized CartItem component
const CartItem = memo(({ item, onUpdateQuantity, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false)
  const [quantityChanging, setQuantityChanging] = useState(false)

  const handleQuantityChange = useCallback(async (delta) => {
    const newQuantity = item.quantity + delta
    if (newQuantity < 0) return
    
    setQuantityChanging(true)
    await new Promise(resolve => setTimeout(resolve, 150))
    onUpdateQuantity(item.id, newQuantity)
    setQuantityChanging(false)
  }, [item.id, item.quantity, onUpdateQuantity])

  const handleRemove = useCallback(async () => {
    setIsRemoving(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    onRemove(item.id)
  }, [item.id, onRemove])

  // Safely parse price with error handling
  const price = item.priceValue || parsePrice(item.price, 0)
  const itemTotal = price * (item.quantity || 1)

  if (isRemoving) {
    return null // Don't render if being removed (for smooth exit animation)
  }

  return (
    <div className={`bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 transition-all duration-300 ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      {/* Product Image */}
      <div className="w-full sm:w-32 h-48 sm:h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              const fallback = e.target.parentElement?.querySelector('.image-fallback')
              if (fallback) fallback.style.display = 'flex'
            }}
          />
        ) : null}
        <div className={`w-full h-full bg-gradient-to-br ${item.color || 'from-gray-200 to-gray-300'} ${item.image ? 'hidden image-fallback' : 'flex'} items-center justify-center text-4xl absolute inset-0`}>
          {item.icon || '📦'}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
          <p className="text-lg font-semibold text-onam-green">{formatPrice(price)} each</p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className={`flex items-center border border-gray-300 rounded-lg transition-all duration-200 ${quantityChanging ? 'scale-105 border-onam-green' : 'scale-100'}`}>
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantityChanging || item.quantity <= 1}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              {quantityChanging && item.quantity === 1 ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              )}
            </button>
            <span className={`px-4 py-2 text-gray-900 font-semibold min-w-[3rem] text-center transition-all duration-200 ${quantityChanging ? 'scale-110 text-onam-green' : 'scale-100'}`}>
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantityChanging}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              {quantityChanging ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </div>

          {/* Item Total */}
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{formatPrice(itemTotal)}</p>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Remove item from cart"
            title="Remove from cart"
          >
            {isRemoving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
})

CartItem.displayName = 'CartItem'

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, totalItems, clearCart } = useCart()
  const navigate = useNavigate()

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) return
    navigate('/checkout')
  }, [cartItems.length, navigate])

  const isEmpty = cartItems.length === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 font-heading">Shopping Cart</h1>
          <p className="text-gray-600">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {isEmpty ? (
          /* Empty Cart */
          <div className="bg-white rounded-xl shadow-lg p-12 text-center animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce-slow">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some items to get started!</p>
            <Link
              to="/shopping"
              className="inline-block bg-onam-green text-white font-semibold py-3 px-8 rounded-full hover:bg-green-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CartItem
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              </div>
            ))}

              {/* Continue Shopping */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <Link
                  to="/shopping"
                  className="text-onam-green hover:text-green-700 font-semibold flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-onam-green">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-onam-green">₹{totalPrice.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-onam-gold text-white font-semibold py-3 px-6 rounded-full hover:bg-amber-600 transition-colors mb-4"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={clearCart}
                  className="w-full text-gray-600 hover:text-red-600 font-medium py-2 transition-colors text-sm"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart

