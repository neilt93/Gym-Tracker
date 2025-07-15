import { PrismaClient, MuscleGroup, WorkoutType, Difficulty } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      height: 175, // cm
      weight: 70, // kg
      age: 25,
      goals: 'Build muscle and improve strength',
      experienceLevel: 'INTERMEDIATE',
      preferredUnit: 'KG',
    },
  })

  // Seed exercises
  const exercises = await prisma.exercise.createMany({
    data: [
      { 
        name: 'Bench Press', 
        muscleGroup: MuscleGroup.CHEST,
        description: 'A compound exercise that primarily targets the chest muscles',
        difficulty: Difficulty.INTERMEDIATE,
        equipment: 'Barbell, Bench',
        targetMuscles: ['CHEST', 'SHOULDERS', 'TRICEPS'],
      },
      { 
        name: 'Deadlift', 
        muscleGroup: MuscleGroup.BACK,
        description: 'A compound exercise that targets the entire posterior chain',
        difficulty: Difficulty.ADVANCED,
        equipment: 'Barbell',
        targetMuscles: ['BACK', 'LEGS', 'CORE'],
      },
      { 
        name: 'Squat', 
        muscleGroup: MuscleGroup.LEGS,
        description: 'A compound exercise that targets the lower body',
        difficulty: Difficulty.INTERMEDIATE,
        equipment: 'Barbell, Rack',
        targetMuscles: ['LEGS', 'CORE'],
      },
      { 
        name: 'Shoulder Press', 
        muscleGroup: MuscleGroup.SHOULDERS,
        description: 'An overhead pressing movement that targets the shoulders',
        difficulty: Difficulty.INTERMEDIATE,
        equipment: 'Dumbbells or Barbell',
        targetMuscles: ['SHOULDERS', 'TRICEPS'],
      },
      { 
        name: 'Bicep Curl', 
        muscleGroup: MuscleGroup.ARMS,
        description: 'An isolation exercise for the biceps',
        difficulty: Difficulty.BEGINNER,
        equipment: 'Dumbbells or Barbell',
        targetMuscles: ['BICEPS'],
      },
      { 
        name: 'Plank', 
        muscleGroup: MuscleGroup.CORE,
        description: 'An isometric exercise that strengthens the core',
        difficulty: Difficulty.BEGINNER,
        equipment: 'None',
        targetMuscles: ['CORE', 'SHOULDERS'],
      },
    ],
    skipDuplicates: true,
  })

  // Fetch exercises with IDs
  const allExercises = await prisma.exercise.findMany()

  // Create a workout with a couple of sets
  await prisma.workout.create({
    data: {
      userId: user.id,
      name: 'Push Day',
      type: WorkoutType.STRENGTH,
      status: 'COMPLETED',
      startedAt: new Date(),
      completedAt: new Date(),
      duration: 60,
      notes: 'Great workout, felt strong today',
      sets: {
        create: [
          {
            exerciseId: allExercises.find(e => e.name === 'Bench Press')!.id,
            reps: 8,
            weight: 135,
            rpe: 8,
            setIndex: 1,
            notes: 'Felt good, might increase weight next time',
          },
          {
            exerciseId: allExercises.find(e => e.name === 'Shoulder Press')!.id,
            reps: 10,
            weight: 60,
            rpe: 7,
            setIndex: 2,
            notes: 'Form was solid',
          },
        ],
      },
    },
  })

  // Create some body measurements
  await prisma.bodyMeasurement.create({
    data: {
      userId: user.id,
      chest: 100,
      waist: 80,
      hips: 90,
      biceps: 35,
      thighs: 55,
      date: new Date(),
      notes: 'Initial measurements',
    },
  })

  // Create a personal record
  await prisma.personalRecord.create({
    data: {
      userId: user.id,
      exerciseId: allExercises.find(e => e.name === 'Bench Press')!.id,
      weight: 150,
      reps: 1,
      date: new Date(),
      notes: 'New PR!',
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
