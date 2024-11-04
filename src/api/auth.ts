// Import necessary modules
import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import prisma from "../lib/prismaClient"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import { devLog } from "../utils/dev"
import { token } from "morgan"

// Limit requests to 5 per minute
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again after a minute.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
})

const router = express.Router()

// Environment variables for secret keys
const JWT_SECRET = process.env.JWT_SECRET
const REFRESH_SECRET = process.env.REFRESH_SECRET

if (!JWT_SECRET || !REFRESH_SECRET) {
  console.error("Missing JWT_SECRET or REFRESH_SECRET in environment variables")
  process.exit(1)
}

// Middleware to parse cookies
router.use(cookieParser())

// // User register route
router.post("/register", async (req, res) => {
  // const { email, password } = req.body

  // try {
  //   // Hash the password
  //   const hashedPassword = await bcrypt.hash(password, 10)

  //   // Create the user in the database
  //   await prisma.user.create({
  //     data: {
  //       email,
  //       password: hashedPassword
  //     }
  //   })

  //   res.status(201).send({ message: "User created successfully" })
  // } catch (error) {
  //   console.error(error)

  res.status(500).send({ error: "Error creating user" })
  // }
})

// User login route
router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).send({ error: "Invalid credentials" })

    const { password: storedHash, ...safeUserData } = user

    const passwordMatch = await bcrypt.compare(password, storedHash)
    if (!passwordMatch) return res.status(401).send({ error: "Invalid credentials" })

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15m" })
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "7d" })

    const refreshTokenExpiresAt = new Date()
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7)

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt
      }
    })

    const userAgent = req.get("User-Agent") || ""
    const isStrictBrowser = /firefox|safari/i.test(userAgent)

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      ...(isStrictBrowser && { partitioned: true })
    })

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000, // 15 minutes
      ...(isStrictBrowser && { partitioned: true })
    })

    res.status(200).send({ user: safeUserData })
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: "Error logging in" })
  }
})

// Refresh token route
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.cookies
  if (!refreshToken) {
    return res.status(401).send({ error: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as jwt.JwtPayload
    const tokenInDb = await prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    })

    if (!tokenInDb) {
      res.clearCookie("accessToken")
      res.clearCookie("refreshToken")
      return res.status(403).send({ error: "Forbidden: Token not found" })
    }

    if (tokenInDb.revoked) {
      res.clearCookie("accessToken")
      res.clearCookie("refreshToken")
      return res.status(403).send({ error: "Forbidden: Token revoked" })
    }

    if (tokenInDb.expiresAt < new Date()) {
      res.clearCookie("accessToken")
      res.clearCookie("refreshToken")
      return res.status(403).send({ error: "Forbidden: Token expired" })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, username: true }
    })
    if (!user) {
      return res.status(404).send({ error: "User not found" })
    }

    const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, {
      expiresIn: "15m"
    })

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000 // 15 minutes
    })

    res.status(200).send({ user })
  } catch (error) {
    console.error("Token verification error:", error)
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
    res.status(403).send({ error: "Forbidden: Invalid token" })
  }
})

// Logout route
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.cookies

  if (!refreshToken) return res.status(401).send({ error: "Unauthorized" })

  try {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken, revoked: false },
      data: { revoked: true }
    })

    res.clearCookie("refreshToken")
    res.clearCookie("accessToken")

    res.status(200).send({ message: "Logged out successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: "Error logging out" })
  }
})

export default router
