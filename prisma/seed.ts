import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  const robskyEmail = "robsky@example.com"
  const routineId = 1

  const user = await prisma.user.upsert({
    where: { email: robskyEmail },
    update: {},
    create: {
      email: robskyEmail,
      username: "Robsky",
      password: await bcrypt.hash("Just4Dev2k24!", 10)
    }
  })

  const name = "Hybrid 5x5 x PPL: Push"
  await prisma.routine.upsert({
    where: { id: routineId },
    update: {},
    create: {
      id: routineId,
      name,
      date: new Date(),
      userId: user.id
    }
  })

  const exercises = [
    {
      name: "Squat",
      description: "A lower-body exercise involving bending the knees and lowering the hips.",
      muscleGroup: "Quadriceps, glutes"
    },
    {
      name: "Bench Press",
      description: "A chest exercise that involves pushing a weight upward while lying on a bench.",
      muscleGroup: "Chest, triceps"
    },
    {
      name: "Deadlift",
      description: "A full-body exercise where the barbell is lifted from the ground to the hips.",
      muscleGroup: "Hamstrings, lower back"
    },
    {
      name: "Overhead Press",
      description: "A shoulder exercise involving pressing a weight overhead.",
      muscleGroup: "Shoulders, triceps"
    },
    {
      name: "Pull-Up",
      description: "An upper-body exercise where the body is pulled upward using a horizontal bar.",
      muscleGroup: "Back, biceps"
    },
    {
      name: "Barbell Row",
      description:
        "A back exercise that involves pulling a barbell towards the torso while bent over.",
      muscleGroup: "Back, biceps"
    },
    {
      name: "Lunge",
      description: "A lower-body exercise involving stepping forward and lowering the hips.",
      muscleGroup: "Quadriceps, glutes"
    },
    {
      name: "Bicep Curl",
      description: "An arm exercise involving curling a dumbbell toward the shoulder.",
      muscleGroup: "Biceps, forearms"
    },
    {
      name: "Tricep Dip",
      description:
        "An arm exercise involving lowering the body by bending the elbows and pushing back up.",
      muscleGroup: "Triceps, chest"
    },
    {
      name: "Leg Press",
      description:
        "A leg exercise that involves pressing a weight away from the body with the legs.",
      muscleGroup: "Quadriceps, glutes"
    }
  ]

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name }, // Check if the exercise already exists by name
      update: {}, // If it exists, do nothing (you could add an update here if needed)
      create: {
        name: exercise.name,
        description: exercise.description,
        muscleGroup: exercise.muscleGroup
      }
    })
  }

  console.log("Seed data created or already exists!")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
