'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TEST_USER_ID = '0' // ← your real user id

const MUSCLE_GROUPS = [
  'CHEST',
  'BACK',
  'LEGS',
  'SHOULDERS',
  'ARMS',
  'CORE',
  'FULL_BODY',
] as const

export default function AddExercisePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const fd = new FormData(e.currentTarget as HTMLFormElement)

    /* ⚙️ build payload the API expects */
    const payload: {
      userId: string,
      exerciseName: FormDataEntryValue | null,
      reps: number,
      weight: number,
      muscleGroup: FormDataEntryValue | null,
    } = {
      userId: TEST_USER_ID,
      exerciseName: fd.get('exerciseName'),
      reps: Number(fd.get('reps')),
      weight: Number(fd.get('weight')),
      muscleGroup: fd.get('muscleGroup'),
    }

    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('API error')
      console.log('✅ Saved workout')
      router.push('/')
    } catch (err) {
      console.error(err)
      alert('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow"
      >
        <h1 className="mb-4 text-center text-2xl font-bold">Add Exercise</h1>

        {/* Exercise name */}
        <div>
          <label className="mb-1 block text-sm font-medium">Exercise name</label>
          <input
            name="exerciseName"
            required
            placeholder="Bench Press"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {/* Muscle group */}
        <div>
          <label className="mb-1 block text-sm font-medium">Muscle&nbsp;group</label>
          <select
            name="muscleGroup"
            required
            className="w-full rounded-md border px-3 py-2"
            defaultValue="">
            <option value="" disabled>Select…</option>
            {MUSCLE_GROUPS.map(g => (
              <option key={g} value={g}>{g.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        {/* Reps */}
        <div>
          <label className="mb-1 block text-sm font-medium">Reps</label>
          <input
            name="reps"
            type="number"
            min="1"
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="mb-1 block text-sm font-medium">Weight (lbs)</label>
          <input
            name="weight"
            type="number"
            min="0"
            step="0.5"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </main>
  )
}
