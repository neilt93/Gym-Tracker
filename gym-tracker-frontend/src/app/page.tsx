'use client'
import { useState } from 'react'
// Example hardcoded user ID
const TEST_USER_ID = 'f26f3d36-2944-4e0b-8fe7-c63087995366'


export default function Home() {
  const [loading, setLoading] = useState(false)

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
          Welcome to Gym Tracker
        </h1>

        <button
          onClick={() => alert('Add Exercise clicked')}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Add Exercise'}
        </button>
      </div>
    </main>
  )
}

  
