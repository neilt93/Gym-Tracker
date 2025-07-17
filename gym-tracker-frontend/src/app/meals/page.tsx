'use client'
import { useEffect, useState } from 'react'
import { TEST_USER_ID } from '@/lib/constants'

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

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    protein: '',
    carbs: '',
    fat: '',
    calories: '',
  })

  useEffect(() => {
    fetchMeals()
  }, [])

  const fetchMeals = async () => {
    try {
      const response = await fetch('/api/meals')
      if (!response.ok) throw new Error('Failed to fetch meals')
      const mealsData = await response.json()
      setMeals(mealsData)
    } catch (err) {
      console.error('Error fetching meals:', err)
      alert('Failed to load meals')
    } finally {
      setLoading(false)
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

  const calculateTotalCalories = (protein: number, carbs: number, fat: number) => {
    return protein * 4 + carbs * 4 + fat * 9
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Please enter a meal name')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          image: selectedImage || '',
          protein: parseFloat(formData.protein) || 0,
          carbs: parseFloat(formData.carbs) || 0,
          fat: parseFloat(formData.fat) || 0,
          calories: formData.calories ? parseInt(formData.calories) : calculateTotalCalories(
            parseFloat(formData.protein) || 0,
            parseFloat(formData.carbs) || 0,
            parseFloat(formData.fat) || 0
          ),
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
      setModalVisible(false)
      setEditingMeal(null)
      
      alert('Meal added successfully!')
    } catch (error) {
      console.error('Error adding meal:', error)
      alert('Failed to add meal. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal)
    setFormData({
      name: meal.name,
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fat: meal.fat.toString(),
      calories: meal.calories.toString(),
    })
    setSelectedImage(meal.image || null)
    setModalVisible(true)
  }

  const handleUpdateMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMeal || !formData.name.trim()) {
      alert('Please enter a meal name')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/meals/${editingMeal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          image: selectedImage || '',
          protein: parseFloat(formData.protein) || 0,
          carbs: parseFloat(formData.carbs) || 0,
          fat: parseFloat(formData.fat) || 0,
          calories: formData.calories ? parseInt(formData.calories) : calculateTotalCalories(
            parseFloat(formData.protein) || 0,
            parseFloat(formData.carbs) || 0,
            parseFloat(formData.fat) || 0
          ),
        }),
      })

      if (!response.ok) throw new Error('Failed to update meal')

      const updatedMeal = await response.json()
      setMeals(prev => prev.map(meal => meal.id === editingMeal.id ? updatedMeal : meal))
      
      // Reset form
      setFormData({
        name: '',
        protein: '',
        carbs: '',
        fat: '',
        calories: '',
      })
      setSelectedImage(null)
      setModalVisible(false)
      setEditingMeal(null)
      
      alert('Meal updated successfully!')
    } catch (error) {
      console.error('Error updating meal:', error)
      alert('Failed to update meal. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return

    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete meal')

      setMeals(prev => prev.filter(meal => meal.id !== mealId))
      alert('Meal deleted successfully!')
    } catch (error) {
      console.error('Error deleting meal:', error)
      alert('Failed to delete meal. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      protein: '',
      carbs: '',
      fat: '',
      calories: '',
    })
    setSelectedImage(null)
    setEditingMeal(null)
    setModalVisible(false)
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Food Tracker</h1>
        <button
          onClick={() => setModalVisible(true)}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Add Meal
        </button>
      </div>

      {/* Meals Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {meals.map((meal) => (
          <div key={meal.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {meal.image && (
              <div className="h-48 overflow-hidden">
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{meal.name}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{meal.protein}g</div>
                  <div className="text-sm text-gray-600">
                    Protein
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{meal.carbs}g</div>
                  <div className="text-sm text-gray-600">
                    Carbs
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{meal.fat}g</div>
                  <div className="text-sm text-gray-600">Fat</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{meal.calories}</div>
                  <div className="text-sm text-gray-600">
                    Calories
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-4">
                {new Date(meal.timestamp).toLocaleString()}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditMeal(meal)}
                  className="flex-1 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteMeal(meal.id)}
                  className="flex-1 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {meals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No meals yet. Add your first meal to get started!</p>
        </div>
      )}

      {/* Add/Edit Meal Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingMeal ? 'Edit Meal' : 'Add Meal'}
            </h2>
            <form onSubmit={editingMeal ? handleUpdateMeal : handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meal Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Grilled Chicken Salad"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      name="protein"
                      value={formData.protein}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      name="carbs"
                      value={formData.carbs}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      name="fat"
                      value={formData.fat}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories (optional - will be calculated if empty)
                  </label>
                  <input
                    type="number"
                    name="calories"
                    value={formData.calories}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Auto-calculated"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving...' : (editingMeal ? 'Update' : 'Save')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 