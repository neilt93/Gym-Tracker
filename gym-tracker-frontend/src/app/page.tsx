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

  // AI Assistant State
  const [workoutTip, setWorkoutTip] = useState('')
  const [mood, setMood] = useState('')
  const [moodInsight, setMoodInsight] = useState('')
  const [journalText, setJournalText] = useState('')
  const [journalAnalysis, setJournalAnalysis] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

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
        
        // Get initial workout tip
        getWorkoutTip(workoutsData, mealsData)
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getWorkoutTip = async (workoutsData: Workout[], mealsData: Meal[]) => {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'workout_tips',
          data: {
            recentWorkouts: workoutsData.slice(0, 5),
            workoutFrequency: workoutsData.length,
            totalMeals: mealsData.length
          }
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setWorkoutTip(result.response)
      }
    } catch (error) {
      console.error('Error getting workout tip:', error)
    }
  }

  const getMoodInsight = async () => {
    if (!mood.trim()) return
    
    setAiLoading(true)
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mood_insights',
          data: {
            mood: mood.toLowerCase(),
            userData: {
              recentWorkouts: workouts.slice(0, 3),
              workoutFrequency: workouts.length
            }
          }
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setMoodInsight(result.response)
      }
    } catch (error) {
      console.error('Error getting mood insight:', error)
    } finally {
      setAiLoading(false)
    }
  }

  const analyzeJournal = async () => {
    if (!journalText.trim()) return
    
    setAiLoading(true)
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'journal_analysis',
          data: { text: journalText }
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setJournalAnalysis(result.response)
      }
    } catch (error) {
      console.error('Error analyzing journal:', error)
    } finally {
      setAiLoading(false)
    }
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
        {/* Dashboard Tile */}
        <Link href="/dashboard" className="block">
          <div className="rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white">
            <h2 className="mb-4 text-xl font-semibold">Dashboard</h2>
            <p className="text-gray-200">View your stats, progress, and analytics.</p>
          </div>
        </Link>

        {/* Add Workout Tile */}
        <Link href="/add-exercise" className="block">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white">
            <h2 className="mb-4 text-xl font-semibold">Add Workout</h2>
            <p className="text-blue-100">Track your strength training and cardio sessions.</p>
          </div>
        </Link>

        {/* Food Tracker Tile */}
        <Link href="/meals" className="block">
          <div className="rounded-xl bg-gradient-to-br from-green-500 to-teal-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white">
            <h2 className="mb-4 text-xl font-semibold">Food Tracker</h2>
            <p className="text-green-100">Track your meals and macros.</p>
          </div>
        </Link>
      </div>

      {/* AI Assistant Section */}
      <div className="mt-12 rounded-xl bg-white p-6 shadow-lg border border-gray-100">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">AI Assistant</h2>
        
        {/* Workout Tips */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Workout Help & Tips</h3>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p className="text-gray-700">{workoutTip || "Loading workout tips..."}</p>
          </div>
        </div>

        {/* Mood Tracking */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">How I Feel</h3>
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              placeholder="e.g. Motivated, tired, sore..." 
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              onClick={getMoodInsight}
              disabled={aiLoading || !mood.trim()}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? 'Analyzing...' : 'Get Insight'}
            </button>
          </div>
          {moodInsight && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-l-4 border-green-400">
              <p className="text-gray-700">{moodInsight}</p>
            </div>
          )}
        </div>

        {/* Journal */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Journal</h3>
          <textarea 
            placeholder="Write your thoughts, reflections, or notes here..." 
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
          />
          <div className="flex gap-2">
            <button 
              onClick={analyzeJournal}
              disabled={aiLoading || !journalText.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? 'Analyzing...' : 'Analyze Entry'}
            </button>
            <button 
              onClick={() => {
                setJournalText('')
                setJournalAnalysis('')
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
          {journalAnalysis && (
            <div className="mt-3 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-400">
              <p className="text-gray-700">{journalAnalysis}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
  
