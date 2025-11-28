import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { memo } from 'react'

const CartIcon = memo(({ isScrolled = true, isActive = false }) => {
  const { totalItems } = useCart()

  // Color logic matching Navbar items
  const iconColor = isActive
    ? 'text-onam-gold'
    : isScrolled
    ? 'text-gray-600 hover:text-onam-gold'
    : 'text-white/90 hover:text-onam-gold'

  const bgHover = isScrolled
    ? 'hover:bg-gray-100'
    : 'hover:bg-white/10'

  return (
    <Link
      to="/cart"
      className={`relative p-2 rounded-lg transition-all duration-300 ${iconColor} ${bgHover} focus:outline-none focus-visible:ring-2 focus-visible:ring-onam-gold focus-visible:ring-offset-2 no-underline`}
      style={{ 
        border: 'none !important', 
        outline: 'none !important', 
        boxShadow: 'none !important',
        textDecoration: 'none'
      }}
      aria-label={`Shopping cart with ${totalItems} items`}
      aria-current={isActive ? 'page' : undefined}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-onam-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
})

CartIcon.displayName = 'CartIcon'

export default CartIcon

