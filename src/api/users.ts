import express, { Request, Response } from "express"
import routinesRouter from "./routines" // Import routines router
import movementsRouter from "./movements" // Import movements router
import setsRouter from "./sets" // Import sets router
import prisma from "../lib/prismaClient"

const router = express.Router({ mergeParams: true })

// Get all users
router.get("/", async (_: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany()
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// Get a specific user by ID
router.get("/:userId", async (req: Request, res: Response) => {
  res.json({ message: `Hello from user ${req.params.userId}!` })
})

router.use("/:userId/routines", routinesRouter)
router.use("/:userId/routines/:routineId/movements", movementsRouter)
router.use("/:userId/routines/:routineId/movements/:movementId/sets", setsRouter)

export default router
