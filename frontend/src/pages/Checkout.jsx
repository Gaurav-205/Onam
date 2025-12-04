import { useNavigate } from 'react-router-dom'

const Checkout = () => {
  const navigate = useNavigate()

  // Checkout is currently not available
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Checkout Not Available</h2>
        <p className="text-gray-600 mb-6">Checkout is currently disabled. Please try again later.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/cart')}
            className="bg-gray-500 text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-600 transition-colors"
          >
            Back to Cart
          </button>
          <button
            onClick={() => navigate('/shopping')}
            className="bg-onam-green text-white font-semibold py-3 px-8 rounded-full hover:bg-green-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

export default Checkout
