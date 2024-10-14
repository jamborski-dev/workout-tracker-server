import express, { Request, Response } from "express"
import prisma from "../lib/prismaClient"

const router = express.Router({ mergeParams: true }) // Merge params to access userId, routineId, and movementId

// Get all sets for a specific movement of a routine
router.get("/", async (req: Request, res: Response) => {
  const { userId, routineId, movementId } = req.params
  res.json({
    message: `Get all sets for movement ${movementId} of routine ${routineId} for user ${userId}`
  })
  // Fetch sets for the movementId, routineId, and userId from database
})

// Get a specific set for a movement
router.get("/:setId", async (req: Request, res: Response) => {
  const { userId, routineId, movementId, setId } = req.params
  res.json({
    message: `Get set ${setId} for movement ${movementId} of routine ${routineId} for user ${userId}`
  })
  // Fetch a specific set for movementId and userId from database
})

// Create a new set for a movement
router.post("/", async (req: Request, res: Response) => {
  const { movementId } = req.params
  const { plannedReps, plannedWeight } = req.body

  try {
    const newSet = await prisma.set.create({
      data: {
        movementId: parseInt(movementId),
        plannedReps,
        plannedWeight
      }
    })

    res.status(201).json(newSet)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to add set" })
  }
})

export default router
