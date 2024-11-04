import express, { Request, Response } from "express"
import prisma from "../lib/prismaClient"
import { AuthenticatedRequest } from "../types/request"

const router = express.Router({ mergeParams: true }) // Merge params to access userId

// Get all routines for a user
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  // Fetch routines for userId from database
  const userId = Number(req.userId)
  try {
    const routines = await prisma.routine.findMany({
      where: { userId }
    })

    res.json(routines)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch routines" })
  }
})

// Get a specific routine for a user
router.get("/:routineId", async (req: AuthenticatedRequest, res: Response) => {
  const { routineId } = req.params
  const userId = Number(req.userId)

  // Fetch a specific routine for routineId and userId from database
  try {
    const routine = await prisma.routine.findUnique({
      where: { id: Number(routineId), userId },
      include: {
        movements: {
          include: {
            sets: {
              orderBy: {
                order: "asc"
              }
            }
          },
          orderBy: {
            order: "asc"
          }
        }
      }
    })

    if (!routine) {
      return res.status(404).json({ error: "Routine not found" })
    }

    res.json(routine)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch routine" })
  }
})

// POST /api/routines
router.post("/init", async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.userId)
  try {
    const newRoutine = await prisma.routine.create({
      data: {
        user: {
          connect: { id: userId }
        }
      }
    })

    res.status(201).json({ id: newRoutine.id }) // Return the routine ID
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create routine" })
  }
})

router.patch("/:routineId", async (req: AuthenticatedRequest, res: Response) => {
  const { routineId } = req.params
  const userId = Number(req.userId)

  try {
    const updatedRoutine = await prisma.routine.update({
      where: { id: Number(routineId), userId },
      data: { ...req.body }
    })

    res.json(updatedRoutine)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update routine" })
  }
})

// Create a new routine for a user
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.userId)
  const { name, date, movements } = req.body // Receive the routine and movements data

  try {
    // Create a routine and its related movements and sets in a transaction
    const newRoutine = await prisma.$transaction(async (prisma: any) => {
      // Create the routine
      const routine = await prisma.routine.create({
        data: {
          userId,
          name,
          date,
          movements: {
            create: movements.map((movement: any) => ({
              exerciseId: movement.exerciseId,
              sets: {
                create: movement.sets.map((set: any) => ({
                  plannedReps: set.plannedReps,
                  plannedWeight: set.plannedWeight,
                  restTime: set.restTime
                }))
              }
            }))
          }
        },
        include: {
          movements: {
            include: {
              sets: true
            }
          }
        }
      })

      return routine
    })

    res.status(201).json(newRoutine) // Return the created routine with movements and sets
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Internal server error" })
  }
})

router.delete("/:routineId", async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.userId)
  const { routineId } = req.params

  try {
    await prisma.routine.delete({
      where: { id: Number(routineId), userId }
    })

    res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to delete routine" })
  }
})

export default router
