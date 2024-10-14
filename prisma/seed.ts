import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const exercises = [
    {
      name: "Squat",
      description: "A lower-body exercise involving bending the knees and lowering the hips."
    },
    {
      name: "Bench Press",
      description: "A chest exercise that involves pushing a weight upward while lying on a bench."
    },
    {
      name: "Deadlift",
      description: "A full-body exercise where the barbell is lifted from the ground to the hips."
    },
    {
      name: "Overhead Press",
      description: "A shoulder exercise involving pressing a weight overhead."
    },
    {
      name: "Pull-Up",
      description: "An upper-body exercise where the body is pulled upward using a horizontal bar."
    },
    {
      name: "Barbell Row",
      description:
        "A back exercise that involves pulling a barbell towards the torso while bent over."
    },
    {
      name: "Lunge",
      description: "A lower-body exercise involving stepping forward and lowering the hips."
    },
    {
      name: "Bicep Curl",
      description: "An arm exercise involving curling a dumbbell toward the shoulder."
    },
    {
      name: "Tricep Dip",
      description:
        "An arm exercise involving lowering the body by bending the elbows and pushing back up."
    },
    {
      name: "Leg Press",
      description:
        "A leg exercise that involves pressing a weight away from the body with the legs."
    }
  ]

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name }, // Check if the exercise already exists by name
      update: {}, // If it exists, do nothing (you could add an update here if needed)
      create: {
        name: exercise.name,
        description: exercise.description
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
