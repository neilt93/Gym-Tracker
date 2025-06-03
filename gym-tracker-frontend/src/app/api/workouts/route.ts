import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("📦 Received workout POST body:", body)

    const workout = await prisma.workout.create({
      data: {
        startedAt: new Date(),
        user: {
          connect: { id: body.userId }, // ✅ connect to existing user
        },
        sets: {
          create: body.sets.map((set: any) => ({
            reps: set.reps,
            weight: set.weight,
            rpe: set.rpe,
            setIndex: set.setIndex,
            exercise: {
              connect: { id: set.exerciseId }, // ✅ connect to existing exercise
            },
          })),
        },
      },
      include: {
        sets: {
          include: {
            exercise: true,
          },
        },
      },
    })

    return NextResponse.json(workout)
  } catch (error) {
    console.error("❌ Error creating workout:", error)
    return NextResponse.json(
      { error: "Failed to create workout" },
      { status: 500 }
    )
  }
}
