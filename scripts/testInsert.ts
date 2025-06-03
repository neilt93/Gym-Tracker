import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function run() {
  const exercise = await prisma.exercise.create({
    data: {
      name: 'Bench Press',
      muscleGroup: 'CHEST',
    },
  })

  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      workouts: {
        create: {
          startedAt: new Date(),
          sets: {
            create: {
              exerciseId: exercise.id, // ✅ now connects to a real Exercise
              reps: 10,
              weight: 135,
              rpe: 8,
              setIndex: 1,
            },
          },
        },
      },
    },
  })

  console.log('User created:', user)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
