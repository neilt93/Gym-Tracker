import { NextRequest, NextResponse } from 'next/server'
import { TEST_USER_ID } from '@/lib/constants'
import { prisma } from '@/lib/prisma'

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

const analyzeJournal = async (journalText: string) => {
  const messages = [
    {
      role: 'system',
      content: `You are a helpful fitness coach analyzing a user's journal entry. Provide insights, encouragement, and suggestions based on their thoughts and feelings. Keep responses positive and actionable (2-3ntences).`
    },
    {
      role: 'user',
      content: `Please analyze this journal entry and provide helpful insights: ${journalText}`
    }
  ]

  return await callOpenAI(messages)
}

const generateJournalSummary = async (journalText: string) => {
  const messages = [
    {
      role: 'system',
      content: `You are creating a concise summary of a journal entry. Create a brief, informative summary that captures the key points and mood in 1-2entences. Focus on the main themes, goals, or insights mentioned.`
    },
    {
      role: 'user',
      content: `Please create a concise summary of this journal entry: ${journalText}`
    }
  ]

  return await callOpenAI(messages)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case 'chat': {
        const userId = data?.userId || TEST_USER_ID
        const question = data?.question?.trim()
        if (!question) {
          return NextResponse.json({ success: false, error: 'No question provided' }, { status: 400 })
        }
        // Fetch recent data for context
        const [journals, workouts, meals] = await Promise.all([
          prisma.journalEntry.findMany({ where: { userId }, orderBy: { timestamp: 'desc' }, take: 5 }),
          prisma.workout.findMany({
            where: { userId },
            include: { exerciseSets: { include: { exercise: true } } },
            orderBy: { startedAt: 'desc' },
            take: 5,
          }),
          prisma.meal.findMany({ where: { userId }, orderBy: { timestamp: 'desc' }, take: 5 }),
        ])
        // Build context string
        const context = `Recent Journals:\n${journals.map(j => `- ${j.content}`).join('\n') || 'None'}\n\nRecent Workouts:\n${workouts.map(w => `- ${w.name} (${w.exerciseSets.length} sets)`).join('\n') || 'None'}\n\nRecent Meals:\n${meals.map(m => `- ${m.name} (${m.calories} kcal)`).join('\n') || 'None'}`
        const messages = [
          {
            role: 'system',
            content: `You are a helpful fitness assistant. Use the user's question and their recent journals, workouts, and meals to provide a personalized, actionable, and encouraging response. Be concise and friendly.`
          },
          {
            role: 'user',
            content: `User question: ${question}\n\n${context}`
          }
        ]
        const responseText = await callOpenAI(messages)
        // Save to chat history
        await prisma.aIChat.create({
          data: {
            userId,
            question,
            response: responseText,
          },
        })
        // Return updated chat history
        const chatHistory = await prisma.aIChat.findMany({
          where: { userId },
          orderBy: { timestamp: 'desc' },
          take: 20,
        })
        return NextResponse.json({
          success: true,
          response: responseText,
          chatHistory,
          timestamp: new Date().toISOString(),
        })
      }
      case 'workout_tips':
        const tips = await getWorkoutTips(data)
        return NextResponse.json({ 
          success: true, 
          response: tips,
          timestamp: new Date().toISOString()
        })

      case 'journal_analysis':
        const analysis = await analyzeJournal(data.text)
        return NextResponse.json({ 
          success: true, 
          response: analysis,
          timestamp: new Date().toISOString()
        })

      case 'journal_summary':
        const summary = await generateJournalSummary(data.text)
        return NextResponse.json({ 
          success: true, 
          response: summary,
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