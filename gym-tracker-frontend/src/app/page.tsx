'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns'
import { TEST_USER_ID } from '@/lib/constants'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

interface Workout {
  id: string
  name: string
  startedAt: string
  exerciseSets: {
    exercise: {
      name: string
      targetMuscles: string[]
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

export default function HomePage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    protein: '',
    carbs: '',
    fat: '',
    calories: '',
  })

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

  const chartData = {
    datasets: [{
      label: 'Workout Intensity',
      data: workouts.map(workout => ({
        x: new Date(workout.startedAt),
        y: workout.exerciseSets.reduce((total, set) => {
          if (set.duration && set.intensity) {
            return total + (set.duration * set.intensity); // For cardio: duration × intensity
          }
          return total + (set.weight * set.reps); // For strength: weight × reps
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          image: selectedImage,
          protein: parseFloat(formData.protein),
          carbs: parseFloat(formData.carbs),
          fat: parseFloat(formData.fat),
          calories: parseInt(formData.calories),
        }),
      })

      if (!response.ok) throw new Error('Failed to add meal')

      const newMeal = await response.json()
      setMeals(prev => [newMeal, ...prev])
      
      // Reset form
      setFormData({
        name: '',
        protein: '',
        carbs: '',
        fat: '',
        calories: '',
      })
      setSelectedImage(null)
    } catch (error) {
      console.error('Error adding meal:', error)
      alert('Failed to add meal. Please try again.')
    }
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
      <h1 className="mb-8 text-3xl font-bold">Gym Tracker</h1>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Workout Graph Tile */}
        <Link href="/dashboard" className="block">
          <div className="rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Workout Intensity</h2>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </Link>

        {/* Add Workout Tile */}
        <Link href="/add-exercise" className="block">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white">
            <h2 className="mb-4 text-xl font-semibold">Add Workout</h2>
            <p className="text-blue-100">Track your strength training and cardio sessions.</p>
            <div className="mt-4 text-3xl">💪</div>
          </div>
        </Link>

        {/* Food Tracker Tile */}
        <Link href="/meals" className="block">
          <div className="rounded-xl bg-gradient-to-br from-green-500 to-teal-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white">
            <h2 className="mb-4 text-xl font-semibold">Food Tracker</h2>
            <p className="text-green-100">Track your meals and macros.</p>
            <div className="mt-4 text-3xl">🍎</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
  
