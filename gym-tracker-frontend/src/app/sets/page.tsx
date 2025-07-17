"use client"
import { useEffect, useState } from 'react'

interface Set {
  id: string
  exercise: { name: string }
  reps: number
  weight: number
  rpe?: number
  duration?: number
  intensity?: number
  setIndex: number
}

interface Workout {
  id: string
  name: string
  startedAt: string
  exerciseSets: Set[]
}

export default function SetsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        const res = await fetch('/api/workouts')
        if (!res.ok) throw new Error('Failed to fetch workouts')
        const data = await res.json()
        setWorkouts(data)
      } catch (err) {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchWorkouts()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold text-center">All Sets</h1>
      {workouts.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No workouts or sets found.</div>
      ) : (
        <div className="space-y-8">
          {workouts.map(workout => (
            <div key={workout.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="text-xl font-semibold text-gray-800">{workout.name}</div>
                <div className="text-sm text-gray-500">{new Date(workout.startedAt).toLocaleDateString()}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 font-semibold">#</th>
                      <th className="px-4 py-2 font-semibold">Exercise</th>
                      <th className="px-4 py-2 font-semibold">Reps</th>
                      <th className="px-4 py-2 font-semibold">Weight</th>
                      <th className="px-4 py-2 font-semibold">RPE</th>
                      <th className="px-4 py-2 font-semibold">Duration</th>
                      <th className="px-4 py-2 font-semibold">Intensity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workout.exerciseSets.map((set, idx) => (
                      <tr key={set.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-2">{set.setIndex}</td>
                        <td className="px-4 py-2">{set.exercise.name}</td>
                        <td className="px-4 py-2">{set.reps}</td>
                        <td className="px-4 py-2">{set.weight}</td>
                        <td className="px-4 py-2">{set.rpe ?? '-'}</td>
                        <td className="px-4 py-2">{set.duration ?? '-'}</td>
                        <td className="px-4 py-2">{set.intensity ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 