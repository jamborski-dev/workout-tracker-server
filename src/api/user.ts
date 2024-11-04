import express, { Request, Response } from "express"

import prisma from "../lib/prismaClient"
import { AuthenticatedRequest } from "../types/request"

const router = express.Router({ mergeParams: true })

// Get current user
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  const id = req.userId

  if (!id) {
    return res.status(403).json({ error: "Forbidden" })
  }

  try {
    const users = await prisma.user.findUnique({
      where: {
        id: id as number
      },
      select: {
        id: true,
        email: true,
        username: true
      }
    })
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

export default router
