import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TEST_USER_ID } from '@/lib/constants'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First delete all exercise sets for this workout
    await prisma.exerciseSet.deleteMany({
      where: {
        workoutId: params.id,
        workout: {
          userId: TEST_USER_ID, // Ensure user can only delete their own workouts
        },
      },
    });

    // Then delete the workout
    await prisma.workout.delete({
      where: {
        id: params.id,
        userId: TEST_USER_ID, // Ensure user can only delete their own workouts
      },
    });

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting workout:', error)
    return NextResponse.json(
      { error: 'Failed to delete workout' },
      { status: 500 }
    )
  }
} 