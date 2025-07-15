'use client'
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Gym Tracker
        </Link>
        <div className="space-x-4">
          <Link href="/" className="hover:text-blue-200">
            Home
          </Link>
          <Link href="/add-exercise" className="hover:text-blue-200">
            Add Workout
          </Link>
          <Link href="/dashboard" className="hover:text-blue-200">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  )
} 