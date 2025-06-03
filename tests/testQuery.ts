import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function run() {
  const users = await prisma.user.findMany({
    include: {
      workouts: {
        include: {
          sets: {
            include: {
              exercise: true,
            },
          },
        },
      },
    },
  })
  console.dir(users, { depth: null })
}

run().catch(console.error)
