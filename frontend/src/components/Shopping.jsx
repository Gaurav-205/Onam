import { useCallback, useMemo, memo, useState } from 'react'
import { shoppingItems } from '../data/shoppingItems'
import OptimizedImage from './OptimizedImage'
import { useCart } from '../context/CartContext'

const ProductCard = memo(({ item }) => {
  const { addToCart, products } = useCart()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Find dynamic stock for this item
  const dbProduct = products.find(p => p.productId === item.id)
  const stock = dbProduct ? dbProduct.stock : (item.inStock ? 10 : 0)
  const isOutOfStock = stock <= 0

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    setImageError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(false)
  }, [])

  const handleAddToCart = useCallback(() => {
    if (isOutOfStock) return
    addToCart(item)
  }, [item, addToCart, isOutOfStock])

  const handleKeyDown = useCallback((e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }, [])

  return (
    <div className="bg-white overflow-hidden rounded-2xl shadow-lg flex flex-col h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group border border-gray-100 font-sans">
      {/* Product Image Area */}
      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse">
            <div className="w-full h-full flex items-center justify-center">
              <div className="h-16 w-16 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {!imageError && (
          <OptimizedImage
            src={item.image}
            alt={`${item.name} - ${item.description}`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            width={400}
            height={256}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-24 h-24 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-5xl text-white shadow-xl`}>
              {item.icon}
            </div>
          </div>
        )}

        {/* Dynamic Inventory Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-onam-green-dark text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            {item.category || 'Traditional'}
          </span>
          {isOutOfStock ? (
            <span className="bg-onam-red text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm animate-pulse">
              Sold Out
            </span>
          ) : stock <= 5 ? (
            <span className="bg-onam-orange text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              Only {stock} left!
            </span>
          ) : (
            <span className="bg-gray-800/85 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              {stock} In Stock
            </span>
          )}
        </div>
      </div>

      {/* Product Information Area */}
      <div className="bg-white p-6 flex flex-col h-full justify-between flex-1">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {item.name}
          </h3>

          <p className="text-gray-700 text-sm mb-3 font-medium">
            {item.description}
          </p>

          <p className="text-gray-600 text-xs mb-4 leading-relaxed">
            {item.details}
          </p>
        </div>

        {/* Price & Cart Actions */}
        <div className="flex flex-col mt-4 pt-4 border-t border-gray-100">
          <div className="mb-4 flex justify-between items-center">
            <span className="text-2xl font-black text-onam-green-dark" aria-label={`Price: ₹${item.priceValue}`}>
              ₹{item.priceValue}
            </span>
            <span className="text-xs text-gray-500 font-medium">Campus Delivery</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            onKeyDown={(e) => handleKeyDown(e, handleAddToCart)}
            className={`font-semibold py-3 px-6 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-onam-green-dark to-onam-green text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-onam-green'
            }`}
            aria-label={isOutOfStock ? `${item.name} is Sold Out` : `Add ${item.name} to Cart`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  )
})

ProductCard.displayName = 'ProductCard'

const Shopping = () => {
  const memoizedShoppingItems = useMemo(() => shoppingItems, [])

  return (
    <section id="shopping" className="section-padding bg-white relative overflow-hidden" aria-label="Traditional Onam Shopping">
      <div className="absolute top-0 right-0 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-bl from-onam-gold/5 to-transparent rounded-full translate-x-20 sm:translate-x-40 -translate-y-20 sm:-translate-y-40" aria-hidden="true"></div>
      <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-tr from-onam-red/5 to-transparent rounded-full -translate-x-16 sm:-translate-x-32 translate-y-16 sm:translate-y-32" aria-hidden="true"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 font-heading">Traditional Onam Shopping</h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Select traditional attire and Sadya coupons. Reserve yours now with dynamic stock allocation and secure campus checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {memoizedShoppingItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Shopping
