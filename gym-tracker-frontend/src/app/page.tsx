"use client"
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-12 text-4xl font-bold text-center">Gym Tracker</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {/* Dashboard Tile */}
        <Link href="/dashboard" className="block group">
          <div className="rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 h-64 shadow-lg hover:shadow-2xl transition-all duration-300 text-white transform group-hover:scale-105 flex flex-col justify-center items-center text-center">
            <h2 className="mb-4 text-2xl font-semibold">Dashboard</h2>
            <p className="text-gray-200 text-lg">View your stats, progress, and analytics.</p>
          </div>
        </Link>
        {/* Add Workout Tile */}
        <Link href="/add-exercise" className="block group">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 h-64 shadow-lg hover:shadow-2xl transition-all duration-300 text-white transform group-hover:scale-105 flex flex-col justify-center items-center text-center">
            <h2 className="mb-4 text-2xl font-semibold">Add Workout</h2>
            <p className="text-blue-100 text-lg">Track your strength training and cardio sessions.</p>
          </div>
        </Link>
        {/* Food Tracker Tile */}
        <Link href="/meals" className="block group">
          <div className="rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 h-64 shadow-lg hover:shadow-2xl transition-all duration-300 text-white transform group-hover:scale-105 flex flex-col justify-center items-center text-center">
            <h2 className="mb-4 text-2xl font-semibold">Food Tracker</h2>
            <p className="text-green-100 text-lg">Track your meals and macros.</p>
          </div>
        </Link>
        {/* AI Assistant Tile */}
        <Link href="/ai-assistant" className="block group">
          <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 h-64 shadow-lg hover:shadow-2xl transition-all duration-300 text-white transform group-hover:scale-105 flex flex-col justify-center items-center text-center">
            <h2 className="mb-4 text-2xl font-semibold">AI Assistant</h2>
            <p className="text-purple-100 text-lg">Get personalized fitness advice and tips.</p>
          </div>
        </Link>
        {/* Journal Tile */}
        <Link href="/journal" className="block group">
          <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 h-64 shadow-lg hover:shadow-2xl transition-all duration-300 text-white transform group-hover:scale-105 flex flex-col justify-center items-center text-center">
            <h2 className="mb-4 text-2xl font-semibold">Journal</h2>
            <p className="text-orange-100 text-lg">Write your thoughts and track your progress.</p>
          </div>
        </Link>
        {/* Total Sets Tile */}
        <Link href="/sets" className="block group">
          <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 h-64 shadow-lg hover:shadow-2xl transition-all duration-300 text-white transform group-hover:scale-105 flex flex-col justify-center items-center text-center">
            <h2 className="mb-4 text-2xl font-semibold">Total Sets</h2>
            <p className="text-purple-100 text-lg">See all your workout sets and details.</p>
          </div>
        </Link>
      </div>
    </div>
  )
} 