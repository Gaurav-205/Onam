import { useCallback, useMemo, memo } from 'react'
import OptimizedImage from './OptimizedImage'

// Memoized upcoming events data
const upcomingEvents = [
  {
    id: 1,
    month: 'JUN',
    day: '12',
    image: '/pookalam.jpg',
    title: 'Pookalam Competition',
    location: 'MIT ADT University, Pune',
    time: '9:00 am - 9:00 pm',
    description: 'Join our traditional Pookalam (flower carpet) competition! Create beautiful floral designs using fresh flowers and natural materials. Show your creativity and celebrate the essence of Onam.',
    date: '2025-06-12',
    googleFormUrl: 'https://forms.google.com/pookalam-competition'
  },
  {
    id: 2,
    month: 'JUL',
    day: '12',
    image: '/sadya-image.jpeg',
    title: 'Traditional Onam Feast',
    location: 'MIT ADT University, Pune',
    time: '9:00 am - 9:00 pm',
    description: 'Join us for an authentic Onam Sadya featuring 26 traditional dishes served on banana leaves. Experience the rich flavors of Kerala cuisine.',
    date: '2025-07-12',
    googleFormUrl: 'https://forms.google.com/onam-feast'
  },
  {
    id: 3,
    month: 'AUG',
    day: '12',
    image: '/onam-cultural-night.jpg',
    title: 'Onam Cultural Night',
    location: 'MIT ADT University, Pune',
    time: '9:00 am - 9:00 pm',
    description: 'Celebrate Onam with traditional music, dance performances, and cultural activities. Experience the vibrant spirit of Kerala through art and entertainment.',
    date: '2025-08-12',
    googleFormUrl: 'https://forms.google.com/cultural-night'
  },
  {
    id: 4,
    month: 'SEP',
    day: '12',
    image: '/tug-of-war-championship.jpg',
    title: 'Tug of War Championship',
    location: 'MIT ADT University, Pune',
    time: '9:00 am - 9:00 pm',
    description: 'Test your strength and teamwork in our exciting Tug of War championship! Form teams and compete in this traditional sport that symbolizes unity and collective effort.',
    date: '2025-09-12',
    googleFormUrl: 'https://forms.google.com/tug-of-war-championship'
  }
]

// Memoized DateCard component
const DateCard = memo(({ month, day }) => (
  <div className="flex-shrink-0">
    <div className="bg-white rounded-lg p-4 w-20 h-20 flex flex-col items-center justify-center shadow-sm border border-gray-100">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {month}
      </div>
      <div className="text-3xl font-bold text-gray-800">
        {day}
      </div>
    </div>
  </div>
))

DateCard.displayName = 'DateCard'

// Memoized EventImage component
const EventImage = memo(({ image, title }) => {
  return (
    <div className="flex-shrink-0">
      <div className="w-96 h-64 rounded-lg overflow-hidden shadow-md">
        <OptimizedImage
          src={image}
          alt={title}
          className="w-full h-full"
          fallbackIcon="📅"
          loading="lazy"
        />
      </div>
    </div>
  )
})

EventImage.displayName = 'EventImage'

// Memoized EventContent component
const EventContent = memo(({ event }) => {
  const handleViewDetails = useCallback(() => {
    if (event.googleFormUrl && event.googleFormUrl !== "https://forms.google.com/your-form-url") {
      window.open(event.googleFormUrl, '_blank', 'noopener,noreferrer')
    } else {
      alert(`Event details for ${event.title} will be available soon!`)
    }
  }, [event.googleFormUrl, event.title])

  return (
    <div className="flex-1 min-w-0 pt-2 relative min-h-[256px]">
      <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 font-heading">
        {event.title}
      </h3>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>{event.location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span>{event.time}</span>
        </div>
      </div>

      <p className="text-gray-700 leading-relaxed mb-6 font-sans" aria-describedby={`event-${event.id}-description`}>
        {event.description}
      </p>

      <button
        onClick={handleViewDetails}
        className="inline-flex items-center text-gray-800 font-medium hover:text-onam-gold transition-colors duration-200 group absolute bottom-0 left-0 focus:outline-none rounded"
        aria-label={`View details for ${event.title}`}
      >
        View Event Details
        <svg 
          className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
})

EventContent.displayName = 'EventContent'

// Memoized EventCard component
const EventCard = memo(({ event }) => (
  <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6 lg:gap-8">
    <DateCard month={event.month} day={event.day} />
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
