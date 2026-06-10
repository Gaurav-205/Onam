import { useCart } from '../context/CartContext'
import OptimizedImage from './OptimizedImage'
import { useEffect } from 'react'

const CartDrawer = () => {
  const {
    cartItems,
    products,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    totalAmount,
    startCheckout
  } = useCart()

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCartOpen])

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-all duration-300 animate-slide-in">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-onam-green/5 to-onam-gold/5">
            <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <svg className="w-6 h-6 text-onam-green-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Your Shopping Cart</span>
            </h2>
            <button
              onClick={closeCart}
              className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
              aria-label="Close cart drawer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 py-6 overflow-y-auto px-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Your cart is empty</h3>
                  <p className="text-gray-500 text-sm mt-1">Add traditional items to start celebrating Onam!</p>
                </div>
                <button
                  onClick={closeCart}
                  className="bg-onam-green-dark hover:bg-onam-green text-white font-medium py-2.5 px-6 rounded-full transition-colors duration-200"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const dbProduct = products.find(p => p.productId === item.id)
                const currentStock = dbProduct ? dbProduct.stock : 10
                const isOutOfStock = currentStock < item.quantity

                return (
                  <div key={item.id} className="flex space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                      <OptimizedImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        width={80}
                        height={80}
                        sizes="80px"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-base font-bold text-gray-800">{item.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{item.category || 'Traditional Item'}</p>
                        </div>
                        <span className="text-base font-bold text-onam-green-dark">
                          ₹{item.priceValue * item.quantity}
                        </span>
                      </div>

                      {/* Stock Warnings */}
                      {isOutOfStock && (
                        <div className="text-xs text-red-500 font-semibold mt-1 flex items-center space-x-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Only {currentStock} remaining in inventory!</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto">
                        {/* Quantity Adjuster */}
                        <div className="flex items-center border border-gray-200 rounded-full py-1 px-2.5 bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-gray-500 hover:text-gray-800 focus:outline-none p-1"
                            aria-label="Decrease quantity"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-3 text-sm font-semibold text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= currentStock}
                            className="text-gray-500 hover:text-gray-800 focus:outline-none p-1 disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Checkout details */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-100 p-6 bg-gray-50 space-y-4">
              <div className="flex justify-between items-center text-gray-800">
                <span className="text-base font-medium">Subtotal</span>
                <span className="text-2xl font-bold text-onam-green-dark">₹{totalAmount}</span>
              </div>
              <p className="text-xs text-gray-500 leading-normal">
                Includes all event delivery charges inside the campus. Make sure you complete payment to reserve inventory stock.
              </p>
              
              <button
                onClick={startCheckout}
                className="w-full bg-gradient-to-r from-onam-green-dark to-onam-green text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 text-base"
              >
                <span>Proceed to Checkout</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartDrawer
