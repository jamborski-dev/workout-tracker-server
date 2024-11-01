import express, { Request, Response } from "express"
import prisma from "../lib/prismaClient"
import { MovementSet } from "@prisma/client"

const router = express.Router({ mergeParams: true }) // Merge params to access userId, routineId, and movementId

// Create a new set for a movement
router.post("/", async (req: Request, res: Response) => {
  const { movementId } = req.params
  const { order } = req.body

  try {
    const newSet = await prisma.movementSet.create({
      data: {
        order: parseInt(order),
        movement: {
          connect: {
            id: parseInt(movementId)
          }
        }
      }
    })

    res.status(201).json(newSet)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to add set" })
  }
})

router.patch("/", async (req: Request, res: Response) => {
  const { movementId } = req.params
  const { sets, summary } = req.body

  try {
    const updatePromises = sets.map((set: MovementSet) => {
      const { id, ...data } = set

      return prisma.movementSet.update({
        where: { id, AND: { movementId: parseInt(movementId) } },
        data
      })
    })

    const updateSummary = prisma.movement.update({
      where: { id: parseInt(movementId) },
      data: { summary }
    })

    const updatedSets = await Promise.all([...updatePromises, updateSummary])

    res.json(updatedSets)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update sets" })
  }
})

/**
 * Update Set
 *
 * @param req.body
 *   order: number,
 *   plannedReps: number,
 *   actualReps: number,
 *   plannedWeight: float,
 *   actualWeight: float,
 *   * restTime: number (in seconds) - not implemented yet in the client
 *
 */
router.patch("/:setId", async (req: Request, res: Response) => {
  const { movementId, setId } = req.params

  try {
    const updatedMovement = await prisma.movementSet.update({
      where: { id: parseInt(setId), movementId: parseInt(movementId) },
      data: {
        ...req.body
      }
    })

    res.json(updatedMovement)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update movement" })
  }
})

router.delete("/:setId", async (req: Request, res: Response) => {
  const { movementId, setId } = req.params

  try {
    await prisma.movementSet.delete({
      where: {
        id: parseInt(setId),
        movementId: parseInt(movementId)
      }
    })

    res.status(200).json({ setId: parseInt(setId), movementId: parseInt(movementId) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to delete set" })
  }
})

export default router
