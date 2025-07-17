'use client'
import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns'
import Link from 'next/link'
import { Dialog } from '@headlessui/react'
import { Fragment } from 'react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ArcElement
)

interface Workout {
  id: string
  name: string
  startedAt: string
  exerciseSets: {
    exercise: {
      name: string
      targetMuscles: string[]
      muscleGroup: string
    }
    weight: number
    reps: number
    rpe?: number
    duration?: number
    intensity?: number
  }[]
}

interface Meal {
  id: string
  name: string
  image: string
  protein: number
  carbs: number
  fat: number
  calories: number
  timestamp: string
}

export default function DashboardPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [adaptivePlan, setAdaptivePlan] = useState<any>(null)
  const [planLoading, setPlanLoading] = useState(false)

  const handleGeneratePlan = async () => {
    setPlanLoading(true)
    setPlanModalOpen(true)
    try {
      const res = await fetch('/api/plan/adaptive-block', { method: 'POST' })
      const data = await res.json()
      setAdaptivePlan(data.plan)
    } catch (err) {
      setAdaptivePlan(null)
    } finally {
      setPlanLoading(false)
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [workoutsRes, mealsRes] = await Promise.all([
          fetch('/api/workouts'),
          fetch('/api/meals'),
        ])
        
        if (!workoutsRes.ok || !mealsRes.ok) throw new Error('Failed to fetch data')
        
        const [workoutsData, mealsData] = await Promise.all([
          workoutsRes.json(),
          mealsRes.json(),
        ])
        
        setWorkouts(workoutsData)
        setMeals(mealsData)
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Workout Intensity Chart Data
  const workoutIntensityData = {
    datasets: [{
      label: 'Workout Intensity',
      data: workouts.map(workout => ({
        x: new Date(workout.startedAt),
        y: workout.exerciseSets.reduce((total, set) => {
          if (set.duration && set.intensity) {
            return total + (set.duration * set.intensity)
          }
          return total + (set.weight * set.reps)
        }, 0),
      })),
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#667eea',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    }],
  }

  // Weekly Workout Frequency
  const weeklyWorkoutData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Workouts',
      data: [0, 0, 0, 0, 0, 0, 0], // Will be calculated below
      backgroundColor: 'rgba(76, 175, 80, 0.8)',
      borderColor: '#4CAF50',
      borderWidth: 2,
    }],
  }

  // Calculate weekly workout frequency
  const now = new Date()
  const weekStart = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000))
  const weeklyData = [0, 0, 0, 0, 0, 0, 0]

  workouts.forEach(workout => {
    const workoutDate = new Date(workout.startedAt)
    if (workoutDate >= weekStart) {
      const dayOfWeek = workoutDate.getDay()
      weeklyData[dayOfWeek]++
    }
  })

  weeklyWorkoutData.datasets[0].data = weeklyData

  // Muscle Group Distribution
  const muscleGroupData = {
    labels: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
    }],
  }

  // Calculate muscle group distribution
  const muscleGroups = ['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE']
  workouts.forEach(workout => {
    workout.exerciseSets.forEach(set => {
      const muscleGroup = set.exercise.targetMuscles?.[0] || set.exercise.muscleGroup
      const index = muscleGroups.indexOf(muscleGroup)
      if (index !== -1) {
        muscleGroupData.datasets[0].data[index]++
      }
    })
  })

  // Nutrition Summary
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0)
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0)
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0)
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0)

  // Nutrition Chart
  const nutritionData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [{
      data: [totalProtein, totalCarbs, totalFat],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#667eea',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Date',
          color: '#666',
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Intensity Score',
          color: '#666',
        },
      },
    },
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#4CAF50',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Number of Workouts',
          color: '#666',
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
      },
    },
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={handleGeneratePlan}
        >
          Generate Adaptive Block
        </button>
      </div>
      {/* Plan Modal */}
      <Dialog open={planModalOpen} onClose={() => setPlanModalOpen(false)} as={Fragment}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <Dialog.Title className="text-xl font-bold mb-4">4-Week Adaptive Block</Dialog.Title>
            {planLoading ? (
              <div className="text-center py-8">Generating plan...</div>
            ) : adaptivePlan ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {adaptivePlan.map((week: any) => (
                  <div key={week.week} className="border rounded p-3">
                    <div className="font-semibold mb-1">Week {week.week} {week.isDeload && <span className="text-xs text-blue-600">(Deload)</span>}</div>
                    <ul className="ml-4 list-disc">
                      {week.days.map((day: any) => (
                        <li key={day.day} className="mb-1">
                          <span className="font-medium">{day.day}:</span>
                          <ul className="ml-4 list-square">
                            {day.exercises.map((ex: any, i: number) => (
                              <li key={i}>
                                {ex.name}: {ex.sets}x{ex.reps} @ {Math.round(ex.load)}kg
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-red-600">Failed to generate plan.</div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded"
                onClick={() => setPlanModalOpen(false)}
              >
                Close
              </button>
              {adaptivePlan && (
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
                  onClick={() => setPlanModalOpen(false)}
                >
                  Accept Plan
                </button>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Quick Stats */}
      <div className="grid gap-6 mb-8 md:grid-cols-4">
        <Link href="/dashboard" className="group block">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg transition-transform transform group-hover:scale-105 group-hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">Total Workouts</h3>
            <p className="text-3xl font-bold">{workouts.length}</p>
          </div>
        </Link>
        <Link href="/meals" className="group block">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg transition-transform transform group-hover:scale-105 group-hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-300 cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">Total Meals</h3>
            <p className="text-3xl font-bold">{meals.length}</p>
          </div>
        </Link>
        <Link href="/sets" className="group block">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg transition-transform transform group-hover:scale-105 group-hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">Total Sets</h3>
            <p className="text-3xl font-bold">
              {workouts.reduce((total, w) => total + w.exerciseSets.length, 0)}
            </p>
          </div>
        </Link>
        <Link href="/meals" className="group block">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg transition-transform transform group-hover:scale-105 group-hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">Total Calories</h3>
            <p className="text-3xl font-bold">{totalCalories}</p>
          </div>
        </Link>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-8 mb-8 md:grid-cols-2">
        {/* Workout Intensity Chart */}
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-shadow hover:shadow-2xl">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Workout Intensity Over Time</h2>
          <div className="h-64">
            <Line data={workoutIntensityData} options={chartOptions} />
          </div>
        </div>

        {/* Weekly Workout Frequency */}
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-shadow hover:shadow-2xl">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Weekly Workout Frequency</h2>
          <div className="h-64">
            <Bar data={weeklyWorkoutData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid gap-8 mb-8 md:grid-cols-2">
        {/* Muscle Group Distribution */}
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-shadow hover:shadow-2xl">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Muscle Group Distribution</h2>
          <div className="h-64">
            <Doughnut data={muscleGroupData} options={doughnutOptions} />
          </div>
        </div>

        {/* Nutrition Breakdown */}
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-shadow hover:shadow-2xl">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Nutrition Breakdown</h2>
          <div className="h-64">
            <Doughnut data={nutritionData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Nutrition Summary */}
      <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 mb-8 transition-shadow hover:shadow-2xl">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Nutrition Summary</h2>
        <div className="grid gap-6 md:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{totalProtein.toFixed(1)}g</div>
            <div className="text-gray-600">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{totalCarbs.toFixed(1)}g</div>
            <div className="text-gray-600">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{totalFat.toFixed(1)}g</div>
            <div className="text-gray-600">Fat</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{totalCalories}</div>
            <div className="text-gray-600">Calories</div>
          </div>
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-shadow hover:shadow-2xl">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Recent Workouts</h2>
        {workouts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No workouts yet</p>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <Link key={workout.id} href={`/dashboard?workout=${workout.id}`} className="block group">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg transition-transform group-hover:scale-[1.02] group-hover:bg-blue-50 cursor-pointer border border-transparent group-hover:border-blue-300">
                  <div>
                    <h3 className="font-semibold group-hover:text-blue-700 transition-colors">{workout.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(workout.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {workout.exerciseSets.length} sets
                    </span>
                    <div className="text-xs text-gray-400">
                      {workout.exerciseSets.reduce((total, set) => {
                        if (set.duration && set.intensity) {
                          return total + (set.duration * set.intensity)
                        }
                        return total + (set.weight * set.reps)
                      }, 0).toLocaleString()} intensity
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 