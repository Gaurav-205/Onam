import { useMemo, memo } from 'react'
import { upcomingEvents } from '../data/events'
import OptimizedImage from './OptimizedImage'

// Memoized EventImage component
const EventImage = memo(({ image, title }) => {
  const handleImageError = (e) => {
    if (e?.target) {
      e.target.src = '/logo.png'
    }
  }

  return (
    <div className="flex-shrink-0 w-full lg:w-96">
      <div className="w-full h-48 sm:h-56 md:h-64 lg:h-64 rounded-lg overflow-hidden shadow-md">
        <OptimizedImage
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
          width={384}
          height={256}
          sizes="(max-width: 1024px) 100vw, 384px"
        />
      </div>
    </div>
  )
})

EventImage.displayName = 'EventImage'

// Memoized EventContent component
const EventContent = memo(({ event }) => {
  return (
    <div className="flex-1 min-w-0 pt-2 sm:pt-4 lg:pt-2 relative min-h-[192px] sm:min-h-[256px]">
      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 font-heading">
        {event.title}
      </h3>
      
      {/* Confirmation Status Message */}
      <div className="mb-6">
        <div className="inline-flex items-center bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4">
          <svg className="w-4 h-4 mr-2 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-amber-800">
            Event details and schedule yet to be confirmed
          </span>
        </div>
      </div>

      <p className="text-gray-700 leading-relaxed mb-6 font-sans" aria-describedby={`event-${event.id}-description`}>
        {event.description}
      </p>

      <div className="absolute bottom-0 left-0">
        <div className="inline-flex items-center text-gray-500 font-medium">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">More details coming soon</span>
        </div>
      </div>
    </div>
  )
})

EventContent.displayName = 'EventContent'

// Memoized EventCard component
const EventCard = memo(({ event }) => (
  <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6 lg:gap-8 bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
    <EventImage image={event.image} title={event.title} />
    <EventContent event={event} />
  </div>
))

EventCard.displayName = 'EventCard'

const Events = () => {
  // Memoized events data to prevent unnecessary re-renders
  const memoizedEvents = useMemo(() => upcomingEvents, [])

  return (
    <section id="events" className="section-padding bg-white" aria-label="Upcoming Onam Events">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 font-heading">
            Upcoming Events
          </h2>
          <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto mt-3 sm:mt-4 font-sans px-4">
            Discover and participate in exciting Onam celebrations, competitions, and cultural activities throughout the year.
          </p>
        </div>

        {/* Events List */}
        <div className="space-y-8 sm:space-y-12">
          {memoizedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Events
