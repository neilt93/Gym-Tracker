import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TEST_USER_ID } from '@/lib/constants'

export async function GET() {
  try {
    const meals = await prisma.meal.findMany({
      where: {
        userId: TEST_USER_ID,
      },
      orderBy: {
        timestamp: 'desc',
      },
    })

    return NextResponse.json(meals)
  } catch (error) {
    console.error('Error fetching meals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meals' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
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

    const meal = await prisma.meal.create({
      data: {
        name: body.name,
        image: body.image,
        protein: body.protein,
        carbs: body.carbs,
        fat: body.fat,
        calories: body.calories,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
        user: { connect: { id: TEST_USER_ID } },
      },
    })

    return NextResponse.json(meal)
  } catch (error) {
    console.error('Error creating meal:', error)
    return NextResponse.json(
      { error: 'Failed to create meal' },
      { status: 500 }
    )
  }
} 