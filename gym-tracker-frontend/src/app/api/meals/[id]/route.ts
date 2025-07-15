import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TEST_USER_ID } from '@/lib/constants'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    
    const meal = await prisma.meal.update({
      where: {
        id: params.id,
        userId: TEST_USER_ID, // Ensure user can only update their own meals
      },
      data: {
        name: body.name,
        image: body.image,
        protein: body.protein,
        carbs: body.carbs,
        fat: body.fat,
        calories: body.calories,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      },
    })

    return NextResponse.json(meal)
  } catch (error) {
    console.error('Error updating meal:', error)
    return NextResponse.json(
      { error: 'Failed to update meal' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.meal.delete({
      where: {
        id: params.id,
        userId: TEST_USER_ID, // Ensure user can only delete their own meals
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting meal:', error)
    return NextResponse.json(
      { error: 'Failed to delete meal' },
      { status: 500 }
    )
  }
} 