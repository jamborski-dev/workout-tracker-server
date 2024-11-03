import express, { Request, Response } from "express"
import prisma from "../lib/prismaClient" // Import your Prisma client

const router = express.Router()

// Get all exercises
router.get("/", async (_: Request, res: Response) => {
  try {
    const exercises = await prisma.exercise.findMany()
    res.json(exercises)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch exercises" })
  }
})

// Get a single exercise by ID
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: parseInt(id) }
    })
    if (!exercise) {
      return res.status(404).json({ error: "Exercise not found" })
    }
    res.json(exercise)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch exercise" })
  }
})

// Create a new exercise
router.post("/", async (_: Request, res: Response) => {
  try {
    const newExercise = await prisma.exercise.create({})
    res.status(201).json({ id: newExercise.id })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create exercise" })
  }
})

// Update an exercise by ID
router.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const updatedExercise = await prisma.exercise.update({
      where: { id: parseInt(id) },
      data: req.body
    })
    res.json(updatedExercise)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update exercise" })
  }
})

// Delete an exercise by ID
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.exercise.delete({
      where: { id: parseInt(id) }
    })
    res.status(204).send() // Send no content on successful delete
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to delete exercise" })
  }
})

export default router
