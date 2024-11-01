import express, { Request, Response } from "express"
import prisma from "../lib/prismaClient"
import { MovementSet } from "@prisma/client"

const router = express.Router({ mergeParams: true }) // Merge params to access userId and routineId

// create new movement for a routine
// POST /api/routines/:routineId/movements
router.post("/", async (req: Request, res: Response) => {
  const { routineId } = req.params
  const { order } = req.body

  try {
    const newMovement = await prisma.movement.create({
      data: {
        order: parseInt(order),
        routine: {
          connect: { id: parseInt(routineId) } // Replace routineId with the actual routine ID
        }
      }
    })

    res.status(201).json(newMovement)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to add movement" })
  }
})

router.patch("/", async (req: Request, res: Response) => {
  const { routineId } = req.params
  const { payload } = req.body

  try {
    const updatePromises = payload.map((movement: any) => {
      const { id, ...data } = movement

      return prisma.movement.update({
        where: { id, routineId: parseInt(routineId) },
        data
      })
    })

    const updatedMovements = await Promise.all(updatePromises)

    res.json(updatedMovements)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update movements" })
  }
})

router.patch("/:movementId", async (req: Request, res: Response) => {
  const { movementId, routineId } = req.params
  const { summary, notes, exerciseId, order, sets } = req.body

  try {
    // Prepare update data
    const data: any = {
      ...(summary !== undefined && { summary }),
      ...(notes !== undefined && { notes }),
      ...(order !== undefined && { order }),
      ...(typeof exerciseId === "number" && {
        exercise: {
          connect: { id: exerciseId }
        }
      }),
      ...(sets !== undefined && {
        sets: {
          upsert: sets.map(({ id, movementId, ...set }: MovementSet) => ({
            where: { id: id ?? undefined }, // Use id to determine if the set exists, or create new
            create: { ...set },
            update: { ...set }
          }))
        }
      })
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" })
    }

    const updatedMovement = await prisma.movement.update({
      where: {
        id: parseInt(movementId),
        routineId: parseInt(routineId)
      },
      data
    })

    res.json(updatedMovement)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update movement" })
  }
})

router.delete("/:movementId", async (req: Request, res: Response) => {
  const { movementId, routineId } = req.params

  try {
    await prisma.movement.delete({
      where: { id: parseInt(movementId), AND: { routineId: parseInt(routineId) } }
    })

    res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to delete movement" })
  }
})

export default router
