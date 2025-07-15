// src/app/api/workouts/route.ts
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TEST_USER_ID } from '@/lib/constants'

const prismaClient = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json(); // { userId, name, startedAt, exerciseSets: [{ exerciseName, muscleGroup, workoutType, reps, weight, rpe, duration, intensity, setIndex }] } 

    // Update the user's updatedAt field with NYC time
    const nycTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    console.log('NYC time:', nycTime);
    
    // Ensure test user exists
    const user = await prismaClient.user.upsert({
      where: { id: body.userId },
      update: { updatedAt: new Date(nycTime) },
      create: {
        id: body.userId,
        name: 'Test User',
        email: 'test@example.com',
        experienceLevel: 'BEGINNER',
        goals: ['Build Muscle', 'Improve Strength'],
        preferredUnit: 'KG',
        height: 175,
        weight: 75,
        age: 25,
      },
    });

    // Create the workout
    const workout = await prismaClient.workout.create({
      data: {
        name: body.name,
        startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
        user: { connect: { id: body.userId } },
        exerciseSets: {
          create: await Promise.all(body.exerciseSets.map(async (set: any) => {
            // Find or create the exercise
            const exercise = await prismaClient.exercise.upsert({
              where: { name: set.exerciseName },
              update: {},
              create: {
                name: set.exerciseName,
                muscleGroup: set.muscleGroup,
              },
            });
            return {
              exercise: { connect: { id: exercise.id } },
              reps: set.reps,
              weight: set.weight,
              rpe: set.rpe,
              duration: set.duration,
              intensity: set.intensity,
              setIndex: set.setIndex,
            };
          })),
        },
      },
      include: { exerciseSets: true },
    });

    return NextResponse.json(workout);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const workouts = await prisma.workout.findMany({
      where: {
        userId: TEST_USER_ID,
      },
      include: {
        exerciseSets: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}
