import { useCallback, useMemo, memo, useState } from 'react'
import { useToast } from '../hooks/useToast'
import Toast from './Toast'
import { shoppingItems } from '../data/shoppingItems'
import OptimizedImage from './OptimizedImage'

const ProductCard = memo(({ item, onShowToast }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    setImageError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(false)
  }, [])

  const handleDisabledAction = useCallback(() => {
    onShowToast('Shopping cart is temporarily disabled. Please check back soon.', 'info', 2500)
  }, [onShowToast])

  const handleKeyDown = useCallback((e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }, [])

  return (
    <div className="bg-white overflow-hidden rounded-2xl shadow-lg flex flex-col h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
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
            className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
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

      <div className="bg-white p-6 flex flex-col h-full">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {item.name}
        </h3>

        <p className="text-gray-700 text-sm mb-3 font-medium">
          {item.description}
        </p>

        <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-grow">
          {item.details}
        </p>

        <div className="flex flex-col mt-auto pt-4 border-t border-gray-200">
          <div className="mb-4">
            <span className="text-2xl font-bold text-onam-green" aria-label={`Price: ${item.price}`}>
              {item.price}
            </span>
          </div>

          <button
            onClick={handleDisabledAction}
            onKeyDown={(e) => handleKeyDown(e, handleDisabledAction)}
            className="font-semibold py-3 px-6 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 bg-gray-200 text-gray-700 hover:bg-gray-300"
            aria-label={`Cart is disabled for ${item.name}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Cart Disabled</span>
          </button>
        </div>
      </div>
    </div>
  )
})

ProductCard.displayName = 'ProductCard'

const Shopping = () => {
  const { toast, showToast, hideToast } = useToast()

  const handleShowToast = useCallback((message, type, duration) => {
    showToast(message, type, duration)
  }, [showToast])

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
        <div className="absolute top-0 right-0 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-bl from-onam-gold/5 to-transparent rounded-full translate-x-20 sm:translate-x-40 -translate-y-20 sm:-translate-y-40" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-tr from-onam-red/5 to-transparent rounded-full -translate-x-16 sm:-translate-x-32 translate-y-16 sm:translate-y-32" aria-hidden="true"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 font-heading">Traditional Onam Shopping</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Items are visible for preview, but cart and checkout are temporarily disabled.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {memoizedShoppingItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onShowToast={handleShowToast}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Shopping
