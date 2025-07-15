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

const WORKOUT_TYPES = [
  'STRENGTH',
  'CARDIO',
  'HIIT',
  'FLEXIBILITY',
  'RECOVERY',
] as const

interface Set {
  reps: number
  weight: number
  rpe: number | null
  duration?: number // for cardio
  intensity?: number // for cardio (1-10 scale)
}

interface Exercise {
  exerciseName: string
  muscleGroup: string
  workoutType: string
  sets: Set[]
}

export default function AddExercisePage() {
  const [loading, setLoading] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([{ 
    exerciseName: '', 
    muscleGroup: '', 
    workoutType: 'STRENGTH',
    sets: [{ reps: 0, weight: 0, rpe: null }] 
  }])
  const router = useRouter()
  const [workoutName, setWorkoutName] = useState("")

  const addExercise = () => {
    setExercises([...exercises, { 
      exerciseName: '', 
      muscleGroup: '', 
      workoutType: 'STRENGTH',
      sets: [{ reps: 0, weight: 0, rpe: null }] 
    }])
  }

  const deleteExercise = (exerciseIndex: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, index) => index !== exerciseIndex))
    }
  }

  const deleteSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises]
    if (newExercises[exerciseIndex].sets.length > 1) {
      newExercises[exerciseIndex].sets = newExercises[exerciseIndex].sets.filter((_, index) => index !== setIndex)
      setExercises(newExercises)
    }
  }

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises]
    const exercise = newExercises[exerciseIndex]
    const isCardio = exercise.workoutType === 'CARDIO'
    
    if (isCardio) {
      exercise.sets.push({ reps: 0, weight: 0, rpe: null, duration: 0, intensity: 5 })
    } else {
      exercise.sets.push({ reps: 0, weight: 0, rpe: null })
    }
    setExercises(newExercises)
  }

  const updateExercise = (index: number, field: string, value: string) => {
    const newExercises = [...exercises]
    newExercises[index] = { ...newExercises[index], [field]: value }
    
    // If workout type changed to cardio, update the sets
    if (field === 'workoutType' && value === 'CARDIO') {
      newExercises[index].sets = newExercises[index].sets.map(set => ({
        ...set,
        duration: set.duration || 0,
        intensity: set.intensity || 5
      }))
    } else if (field === 'workoutType' && value === 'STRENGTH') {
      newExercises[index].sets = newExercises[index].sets.map(set => ({
        reps: set.reps,
        weight: set.weight,
        rpe: set.rpe
      }))
    }
    
    setExercises(newExercises)
  }

  const updateSet = (exerciseIndex: number, setIndex: number, field: string, value: number | null) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets[setIndex] = { 
      ...newExercises[exerciseIndex].sets[setIndex], 
      [field]: value 
    }
    setExercises(newExercises)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget as HTMLFormElement)
    const workoutName = fd.get('workoutName')
    if (!workoutName) {
      alert('Please fill in all required fields')
      setLoading(false)
      return
    }
    try {
      const payload = {
        userId: TEST_USER_ID,
        name: workoutName,
        startedAt: new Date().toISOString(),
        exerciseSets: exercises.flatMap((exercise, exerciseIndex) =>
          exercise.sets.map((set, setIndex) => ({
            exerciseName: exercise.exerciseName,
            muscleGroup: exercise.muscleGroup,
            workoutType: exercise.workoutType,
            reps: set.reps,
            weight: set.weight,
            rpe: set.rpe,
            duration: set.duration,
            intensity: set.intensity,
            setIndex: setIndex + 1,
          }))
        ),
      }
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('API error')
      router.push('/')
    } catch (err) {
      alert('Failed to save workout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Add Workout</h1>

        {/* Workout name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Workout name</label>
          <input
            name="workoutName"
            required
            placeholder="Push Day"
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Exercises */}
        {exercises.map((exercise, exerciseIndex) => (
          <div key={exerciseIndex} className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Exercise {exerciseIndex + 1}</h2>
              {exercises.length > 1 && (
                <button
                  type="button"
                  onClick={() => deleteExercise(exerciseIndex)}
                  className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete Exercise
                </button>
              )}
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Exercise name</label>
              <input
                required
                placeholder="Bench Press"
                value={exercise.exerciseName}
                onChange={(e) => updateExercise(exerciseIndex, 'exerciseName', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Workout type</label>
              <select
                required
                value={exercise.workoutType}
                onChange={(e) => updateExercise(exerciseIndex, 'workoutType', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {WORKOUT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Muscle group</label>
              <select
                required
                value={exercise.muscleGroup}
                onChange={(e) => updateExercise(exerciseIndex, 'muscleGroup', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select muscle group</option>
                {MUSCLE_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            {/* Sets */}
            {exercise.sets.map((set, setIndex) => (
              <div key={setIndex} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Set {setIndex + 1}</h3>
                  {exercise.sets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteSet(exerciseIndex, setIndex)}
                      className="rounded-md bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete Set
                    </button>
                  )}
                </div>
                
                {exercise.workoutType === 'CARDIO' ? (
                  // Cardio set fields
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Duration (minutes)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.5"
                        value={set.duration || ''}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'duration', parseFloat(e.target.value))}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Intensity (1-10)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="10"
                        step="0.5"
                        value={set.intensity || ''}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'intensity', parseFloat(e.target.value))}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  // Strength set fields
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Reps</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={set.reps}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value))}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Weight (lbs)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.5"
                        value={set.weight}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value))}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">RPE</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={set.rpe || ''}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'rpe', e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addSet(exerciseIndex)}
              className="mt-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Set
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addExercise}
          className="mt-4 rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Add Exercise
        </button>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Workout'}
        </button>
      </form>
    </div>
  )
}
