import { useCallback, useMemo, memo, useState } from 'react'
import { useCart } from '../context/CartContext'
import { useToast } from '../hooks/useToast'
import Toast from './Toast'
import { shoppingItems } from '../data/shoppingItems'
import OptimizedImage from './OptimizedImage'

// Memoized ProductCard component with Add to Cart and Quantity Controls
const ProductCard = memo(({ item, onAddToCart, onUpdateQuantity, isInCart, itemQuantity, onShowToast }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [quantityChanging, setQuantityChanging] = useState(false)

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    setImageError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(false)
  }, [])

  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation()
    if (!item.inStock || addingToCart) return
    
    setAddingToCart(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    onAddToCart(item)
    onShowToast(`${item.name} added to cart!`, 'success')
    setAddingToCart(false)
  }, [item, onAddToCart, onShowToast, addingToCart])

  const handleQuantityChange = useCallback(async (delta) => {
    const newQuantity = itemQuantity + delta
    if (newQuantity < 0) return
    if (newQuantity > 99) {
      onShowToast('Maximum quantity is 99', 'error', 2000)
      return
    }
    
    setQuantityChanging(true)
    await new Promise(resolve => setTimeout(resolve, 150))
    
    if (newQuantity === 0) {
      onShowToast(`${item.name} removed from cart`, 'success')
    } else if (delta > 0) {
      onShowToast(`Increased ${item.name} quantity`, 'success', 2000)
    } else {
      onShowToast(`Decreased ${item.name} quantity`, 'success', 2000)
    }
    
    onUpdateQuantity(item.id, newQuantity)
    setQuantityChanging(false)
  }, [item.id, item.name, itemQuantity, onUpdateQuantity, onShowToast])

  // Keyboard navigation support
  const handleKeyDown = useCallback((e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }, [])

  return (
    <div className="bg-white overflow-hidden rounded-2xl shadow-lg flex flex-col h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      {/* Top Section - Image Area */}
      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Loading State */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse">
            <div className="w-full h-full flex items-center justify-center">
              <div className="h-16 w-16 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Product Image */}
        {!imageError && (
          <OptimizedImage
            src={item.image}
            alt={`${item.name} - ${item.description}`}
            className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            width={400}
            height={256}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        {/* Fallback Icon */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-24 h-24 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-5xl text-white shadow-xl`}>
              {item.icon}
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Traditional
          </span>
          {!item.inStock && (
            <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          )}
        </div>
      </div>
      
      {/* Bottom Section - Product Details */}
      <div className="bg-white p-6 flex flex-col h-full">
        {/* Product Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {item.name}
        </h3>
        
        {/* Tagline */}
        <p className="text-gray-700 text-sm mb-3 font-medium">
          {item.description}
        </p>
        
        {/* Product Description */}
        <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-grow">
          {item.details}
        </p>
        
        {/* Bottom Row - Price and Action */}
        <div className="flex flex-col mt-auto pt-4 border-t border-gray-200">
          {/* Price */}
          <div className="mb-4">
            <span className="text-2xl font-bold text-onam-green" aria-label={`Price: ${item.price}`}>
              {item.price}
            </span>
            {isInCart && itemQuantity > 0 && (
              <span className="text-xs text-onam-green font-medium ml-2 animate-fade-in">
                ({itemQuantity} {itemQuantity === 1 ? 'item' : 'items'} in cart)
              </span>
            )}
          </div>
          
          {/* Action Button or Quantity Controls */}
          {isInCart && itemQuantity > 0 ? (
            /* Quantity Controls - Matching Add to Cart button height */
            <div className={`flex items-center justify-between bg-onam-green/10 rounded-lg py-3 px-2 transition-all duration-300 animate-fade-in ${quantityChanging ? 'scale-95' : 'scale-100'}`}>
              <button
                onClick={() => handleQuantityChange(-1)}
                onKeyDown={(e) => handleKeyDown(e, () => handleQuantityChange(-1))}
                disabled={quantityChanging}
                className="w-8 h-8 rounded-full bg-white text-onam-green font-bold hover:bg-onam-green hover:text-white active:scale-95 transition-all duration-200 flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-onam-green focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                aria-label={itemQuantity === 1 ? "Remove from cart" : "Decrease quantity"}
                title={itemQuantity === 1 ? "Click to remove from cart" : "Decrease quantity"}
              >
                {quantityChanging && itemQuantity === 1 ? (
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-onam-green"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                )}
              </button>
              
              <div className="flex flex-col items-center justify-center flex-1 mx-3 min-w-0">
                <span className={`text-base font-bold text-gray-900 leading-tight transition-all duration-200 ${quantityChanging ? 'scale-110' : 'scale-100'}`}>
                  {itemQuantity}
                </span>
                <span className="text-[10px] text-gray-600 leading-tight">Qty</span>
              </div>
              
              <button
                onClick={() => handleQuantityChange(1)}
                onKeyDown={(e) => handleKeyDown(e, () => handleQuantityChange(1))}
                disabled={quantityChanging || itemQuantity >= 99}
                className="w-8 h-8 rounded-full bg-onam-green text-white font-bold hover:bg-green-700 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-onam-green focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Increase quantity"
                title={itemQuantity >= 99 ? "Maximum quantity reached" : "Increase quantity"}
              >
                {quantityChanging && itemQuantity > 0 ? (
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            /* Add to Cart Button */
            <button 
              onClick={handleAddToCart}
              onKeyDown={(e) => handleKeyDown(e, handleAddToCart)}
              disabled={!item.inStock || addingToCart}
              className={`font-semibold py-3 px-6 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 animate-fade-in ${
                !item.inStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : addingToCart
                  ? 'bg-onam-green text-white cursor-wait'
                  : 'bg-onam-gold text-white hover:bg-amber-600 focus:ring-onam-gold hover:shadow-lg transform hover:scale-105'
              }`}
              aria-label={`Add ${item.name} to cart for ${item.price}`}
            >
              {addingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

ProductCard.displayName = 'ProductCard'

const Shopping = () => {
  const { addToCart, updateQuantity, isInCart, getItemQuantity } = useCart()
  const { toast, showToast, hideToast } = useToast()

  const handleAddToCart = useCallback((item) => {
    addToCart(item)
  }, [addToCart])

  const handleUpdateQuantity = useCallback((productId, quantity) => {
    updateQuantity(productId, quantity)
  }, [updateQuantity])

  const handleShowToast = useCallback((message, type, duration) => {
    showToast(message, type, duration)
  }, [showToast])

  // Memoized shopping items to prevent unnecessary re-renders
  const memoizedShoppingItems = useMemo(() => shoppingItems, [])

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
      <section id="shopping" className="section-padding bg-white relative overflow-hidden" aria-label="Traditional Onam Shopping">
        {/* Shopping Bag Pattern */}
        <div className="absolute top-0 right-0 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-bl from-onam-gold/5 to-transparent rounded-full translate-x-20 sm:translate-x-40 -translate-y-20 sm:-translate-y-40" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-tr from-onam-red/5 to-transparent rounded-full -translate-x-16 sm:-translate-x-32 translate-y-16 sm:translate-y-32" aria-hidden="true"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 font-heading">Traditional Onam Shopping</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Discover the essential traditional items that make Onam celebrations complete - from traditional attire to the grand feast.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {memoizedShoppingItems.map((item) => (
              <ProductCard 
                key={item.id}
                item={item} 
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
                onShowToast={handleShowToast}
                isInCart={isInCart(item.id)}
                itemQuantity={getItemQuantity(item.id)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Shopping
