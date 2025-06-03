'use client'
import { useState } from 'react'
import Link from 'next/link'



// Example hardcoded user ID
const TEST_USER_ID = '0'


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-100">
      <h1 className="text-3xl font-extrabold text-gray-800">
        Welcome to Gym Tracker
      </h1>

      <Link
        href="/add-exercise"
        className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        Add Exercise
      </Link>
    </main>
  )
}
  
