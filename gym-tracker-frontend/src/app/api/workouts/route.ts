// src/app/api/workouts/route.ts
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()           // { userId, exerciseName, reps, weight }

    // 1️⃣  create (or reuse) the exercise by name
    const exercise = await prisma.exercise.upsert({
      where: { name: body.exerciseName },
      update: {},                           // nothing to update if it exists
      create: {
        name: body.exerciseName,
        muscleGroup: 'FULL_BODY',           // TODO: change or accept from body
      },
    })

    // 2️⃣  create the workout + set linked to that exercise
    const workout = await prisma.workout.create({
      data: {
        startedAt: new Date(),
        user: { connect: { id: body.userId } },
        sets: {
          create: [
            {
              exercise: { connect: { id: exercise.id } },
              reps: body.reps,
              weight: body.weight,
              rpe: null,
              setIndex: 1,
            },
          ],
        },
      },
      include: { sets: true },
    })

    return NextResponse.json(workout)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
