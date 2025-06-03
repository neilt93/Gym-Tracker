'use client'
import { useState } from 'react'

export default function Home() {
  const [loading, setLoading] = useState(false)

  async function createWorkout() {
    setLoading(true)
    const res = await fetch('/api/workouts', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'f26f3d36-2944-4e0b-8fe7-c63087995366', // ← Replace with your real userId
        sets: [
          {
            exerciseId: '06aa9736-5f16-40a5-b59d-b33d0930e390', // ← Replace with your real exerciseId
            reps: 100,
            weight: 1111111135,
            rpe: 8,
            setIndex: 1
          }
        ]
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await res.json()
    console.log('Workout Created:', data)
    setLoading(false)
  }

  return (
    <main>
      <button onClick={createWorkout} disabled={loading}>
        {loading ? 'Creating...' : 'Create Workout'}
      </button>
    </main>
  )
}
