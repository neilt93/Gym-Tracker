import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TEST_USER_ID } from '@/lib/constants'

async function getAISummary(content: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'journal_summary',
        data: { text: content },
      }),
    })
    if (response.ok) {
      const result = await response.json()
      return result.response
    }
  } catch (error) {
    console.error('Error generating AI summary:', error)
  }
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

export async function GET() {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId: TEST_USER_ID },
      orderBy: { timestamp: 'desc' },
      take: 50,
    })
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, goals, notes } = body
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Journal content is required' }, { status: 400 })
    }
    // Ensure test user exists
    await prisma.user.upsert({
      where: { id: TEST_USER_ID },
      update: {},
      create: {
        id: TEST_USER_ID,
        name: 'Test User',
        email: 'test@example.com',
        experienceLevel: 'BEGINNER',
        goals: ['Build Muscle', 'Improve Strength'],
        preferredUnit: 'KG',
        height: 175,
        weight: 75,
        age: 25,
      },
    })
    const aiSummary = await getAISummary(content)
    const entry = await prisma.journalEntry.create({
      data: {
        content: content.trim(),
        goals: goals?.trim() || null,
        notes: notes?.trim() || null,
        userId: TEST_USER_ID,
      },
    })
    // Optionally, save the summary in a separate table or as a field if you want
    await prisma.aIInteraction.create({
      data: {
        type: 'journal_summary',
        userInput: content,
        aiResponse: aiSummary,
        userId: TEST_USER_ID,
      },
    })
    return NextResponse.json({ ...entry, aiSummary })
  } catch (error) {
    console.error('Error saving journal entry:', error)
    return NextResponse.json({ error: 'Failed to save journal entry' }, { status: 500 })
  }
} 