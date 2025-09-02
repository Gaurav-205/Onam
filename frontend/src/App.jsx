import './App.css'
import Header from './components/Header.jsx'
import FestivalEvents from './components/FestivalEvents.jsx'
import FestivalMemories from './components/FestivalMemories.jsx'

function App() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Header />
      <section className="mx-auto max-w-5xl px-6 py-10">
        <FestivalEvents />
        <div className="mt-14">
          <FestivalMemories />
        </div>
      </section>
    </main>
  )
}

export default App
