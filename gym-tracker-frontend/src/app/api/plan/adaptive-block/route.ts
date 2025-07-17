import { NextRequest, NextResponse } from 'next/server'

// Mock function to fetch recent workouts (replace with real DB call)
async function getRecentWorkouts(userId: string) {
  // In real implementation, fetch from DB using userId
  return [
    { date: '2024-06-01', exercises: [{ name: 'Squat', sets: 3, reps: 8, load: 100 }] },
    { date: '2024-06-03', exercises: [{ name: 'Bench Press', sets: 3, reps: 8, load: 70 }] },
    { date: '2024-06-05', exercises: [{ name: 'Deadlift', sets: 3, reps: 5, load: 120 }] },
  ]
}

// Simple adaptive block generator (mock RL logic)
function generateAdaptiveBlock(workouts: any[]) {
  // For demo: 3 weeks progressive, 1 week deload
  const baseLoads = {
    'Squat': 100,
    'Bench Press': 70,
    'Deadlift': 120,
  }
  const plan = []
  for (let week = 1; week <= 4; week++) {
    const isDeload = week === 4
    plan.push({
      week,
      isDeload,
      days: [
        {
          day: 'Monday',
          exercises: [
            {
              name: 'Squat',
              sets: 3,
              reps: 8,
              load: isDeload ? baseLoads['Squat'] * 0.7 : baseLoads['Squat'] * (1 + 0.025 * (week - 1)),
            },
          ],
        },
        {
          day: 'Wednesday',
          exercises: [
            {
              name: 'Bench Press',
              sets: 3,
              reps: 8,
              load: isDeload ? baseLoads['Bench Press'] * 0.7 : baseLoads['Bench Press'] * (1 + 0.025 * (week - 1)),
            },
          ],
        },
        {
          day: 'Friday',
          exercises: [
            {
              name: 'Deadlift',
              sets: 3,
              reps: 5,
              load: isDeload ? baseLoads['Deadlift'] * 0.7 : baseLoads['Deadlift'] * (1 + 0.025 * (week - 1)),
            },
          ],
        },
      ],
    })
  }
  return plan
}

export async function POST(req: NextRequest) {
  // In real app, get userId from session/auth
  const userId = 'demo-user'
  const workouts = await getRecentWorkouts(userId)
  const plan = generateAdaptiveBlock(workouts)
  return NextResponse.json({ plan })
} 