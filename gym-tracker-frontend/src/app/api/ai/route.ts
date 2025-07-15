import { NextRequest, NextResponse } from 'next/server'
import { TEST_USER_ID } from '@/lib/constants'

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const callOpenAI = async (messages: any[]) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 300,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

const getWorkoutTips = async (userData: any) => {
  const recentWorkouts = userData.recentWorkouts || []
  const workoutFrequency = userData.workoutFrequency || 0
  const totalMeals = userData.totalMeals || 0

  const workoutSummary = recentWorkouts.map((w: any) => 
    `${w.name} (${w.exerciseSets?.length || 0} sets)`
  ).join(', ')

  const messages = [
    {
      role: 'system',
      content: `You are a knowledgeable fitness coach and personal trainer. Provide specific, actionable workout advice based on the user's data. Keep responses concise (2-3 sentences) and encouraging. Focus on practical tips that can be implemented immediately.`
    },
    {
      role: 'user',
      content: `I'm a fitness enthusiast with the following data:
- Recent workouts: ${workoutSummary || 'None yet'}
- Workout frequency: ${workoutFrequency} total workouts
- Nutrition tracking: ${totalMeals} meals logged

Please provide a personalized workout tip or advice based on this information. If I'm new to working out, give me a beginner-friendly tip. If I'm more experienced, provide advanced advice.`
    }
  ]

  return await callOpenAI(messages)
}

const getMoodInsights = async (mood: string, userData: any) => {
  const recentWorkouts = userData.recentWorkouts || []
  const workoutFrequency = userData.workoutFrequency || 0

  const messages = [
    {
      role: 'system',
      content: `You are an empathetic fitness coach who understands how mood affects workout performance. Provide personalized workout recommendations based on the user's current mood and fitness history. Keep responses encouraging and practical (2-3 sentences).`
    },
    {
      role: 'user',
      content: `I'm feeling ${mood} today. My recent workout history shows ${workoutFrequency} total workouts. Based on how I'm feeling, what type of workout would you recommend for me today? Consider my mood and suggest appropriate intensity, exercise types, or even rest if needed.`
    }
  ]

  return await callOpenAI(messages)
}

const analyzeJournal = async (journalText: string) => {
  const messages = [
    {
      role: 'system',
      content: `You are a supportive fitness coach analyzing a user's journal entry. Provide encouraging feedback and fitness-related insights. Focus on motivation, progress recognition, and gentle suggestions. Keep responses warm and supportive (2-3 sentences).`
    },
    {
      role: 'user',
      content: `Please analyze this fitness journal entry and provide encouraging feedback: "${journalText}"`
    }
  ]

  return await callOpenAI(messages)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case 'workout_tips':
        const tips = await getWorkoutTips(data)
        return NextResponse.json({ 
          success: true, 
          response: tips,
          timestamp: new Date().toISOString()
        })

      case 'mood_insights':
        const insights = await getMoodInsights(data.mood, data.userData)
        return NextResponse.json({ 
          success: true, 
          response: insights,
          timestamp: new Date().toISOString()
        })

      case 'journal_analysis':
        const analysis = await analyzeJournal(data.text)
        return NextResponse.json({ 
          success: true, 
          response: analysis,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid request type' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('AI API error:', error)
    
    // Fallback responses if OpenAI fails
    const fallbackResponses = {
      workout_tips: "Focus on consistency in your workouts. Start with compound movements and gradually increase intensity as you build strength.",
      mood_insights: "Listen to your body today. Adjust your workout intensity based on how you feel - it's perfectly okay to take it easy when needed.",
      journal_analysis: "Thank you for sharing your thoughts! Every entry helps track your fitness journey. Keep up the great work!"
    }
    
    // Try to get the request type for fallback, default to generic response
    let requestType = 'workout_tips'
    try {
      const body = await request.json()
      requestType = body.type || 'workout_tips'
    } catch {
      // If we can't parse the body, use default
    }
    
    return NextResponse.json({ 
      success: true, 
      response: fallbackResponses[requestType as keyof typeof fallbackResponses] || "I'm here to support your fitness journey!",
      timestamp: new Date().toISOString(),
      note: "Using fallback response due to API issue"
    })
  }
} 