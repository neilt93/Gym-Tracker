import { PrismaClient, MuscleGroup } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
    },
  })

  // Seed exercises
  const exercises = await prisma.exercise.createMany({
    data: [
      { name: 'Bench Press', muscleGroup: MuscleGroup.CHEST },
      { name: 'Deadlift', muscleGroup: MuscleGroup.BACK },
      { name: 'Squat', muscleGroup: MuscleGroup.LEGS },
      { name: 'Shoulder Press', muscleGroup: MuscleGroup.SHOULDERS },
      { name: 'Bicep Curl', muscleGroup: MuscleGroup.ARMS },
      { name: 'Plank', muscleGroup: MuscleGroup.CORE },
    ],
    skipDuplicates: true, // Avoid duplicate errors if rerunning
  })

  // Fetch exercises with IDs
  const allExercises = await prisma.exercise.findMany()

  // Create a workout with a couple of sets
  await prisma.workout.create({
    data: {
      userId: user.id,
      startedAt: new Date(),
      sets: {
        create: [
          {
            exerciseId: allExercises.find(e => e.name === 'Bench Press')!.id,
            reps: 8,
            weight: 135,
            rpe: 8,
            setIndex: 1,
          },
          {
            exerciseId: allExercises.find(e => e.name === 'Squat')!.id,
            reps: 5,
            weight: 185,
            rpe: 9,
            setIndex: 2,
          },
        ],
      },
    },
  })

  console.log('✅ Seed complete')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
