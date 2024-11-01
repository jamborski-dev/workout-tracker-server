// Import necessary modules
import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import prisma from "../lib/prismaClient"
import cookieParser from "cookie-parser"

const router = express.Router()

// Environment variables for secret keys
const JWT_SECRET = process.env.JWT_SECRET || "secret"
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh"

// Middleware to parse cookies
router.use(cookieParser())

// User register route
router.post("/register", async (req, res) => {
  const { email, password } = req.body

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user in the database
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    })

    res.status(201).send({ message: "User created successfully" })
  } catch (error) {
    console.error(error)

    res.status(500).send({ error: "Error creating user" })
  }
})

// User login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).send({ error: "Invalid credentials" })
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).send({ error: "Invalid credentials" })
    }

    // Generate access token (short-lived)
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15m" })

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "7d" })

    // Calculate expiration timestamp for the refresh token (7 days from now)
    const refreshTokenExpiresAt = new Date()
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7)

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt
      }
    })

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Set to true in production (HTTPS)
      sameSite: "none"
    })

    res.status(200).send({ accessToken })
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
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET)

    // Check if the refresh token exists in the database
    const tokenInDb = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!tokenInDb) {
      return res.status(403).send({ error: "Forbidden" })
    }

    // Generate a new access token
    const newAccessToken = jwt.sign({ userId: (decoded as jwt.JwtPayload).userId }, JWT_SECRET, {
      expiresIn: "15m"
    })

    res.status(200).send({ accessToken: newAccessToken })
  } catch (error) {
    console.error(error)

    res.status(403).send({ error: "Forbidden" })
  }
})

// Logout route
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.cookies

  if (!refreshToken) {
    return res.status(401).send({ error: "Unauthorized" })
  }

  try {
    // Update the refresh token to set revoked to true
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken, revoked: false },
      data: { revoked: true }
    })

    // Clear the cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true, // Ensure secure in production (HTTPS)
      sameSite: "none"
    })

    res.status(200).send({ message: "Logged out successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: "Error logging out" })
  }
})

export default router