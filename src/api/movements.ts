import express, { Request, Response } from "express"
import prisma from "../lib/prismaClient"

const router = express.Router({ mergeParams: true }) // Merge params to access userId and routineId

// Get all movements for a specific routine of a user
router.get("/", async (req: Request, res: Response) => {
  const { userId, routineId } = req.params
  res.json({ message: `Get all movements for routine ${routineId} of user ${userId}` })
  // Fetch movements for the routineId and userId from database
})

// Get a specific movement for a routine
router.get("/:movementId", async (req: Request, res: Response) => {
  const { userId, routineId, movementId } = req.params
  res.json({ message: `Get movement ${movementId} for routine ${routineId} of user ${userId}` })
  // Fetch a specific movement for routineId and userId from database
})

// POST /api/routines/:routineId/movements
router.post("/", async (req: Request, res: Response) => {
  const { routineId } = req.params
  const { exerciseId, sets } = req.body // sets can be optional

  try {
    const newMovement = await prisma.movement.create({
      data: {
        routineId: parseInt(routineId),
        exerciseId,
        sets: {
          create: sets || [] // Can be empty initially
        }
      }
    })

    res.status(201).json(newMovement)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to add movement" })
  }
})

export default router
