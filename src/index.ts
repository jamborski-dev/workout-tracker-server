import cors from "cors"
import express from "express"
import usersRouter from "./api/users"
import exercisesRouter from "./api/exercises" // Assuming you still need this router
import authRouter from "./api/auth"
import { verifyAuth } from "./middleware/verifyAuth"
import morgan from "morgan"
import path from "path"

// dotenv
require("dotenv").config()

const app = express()

const port = process.env.PORT || 5001
const origin = process.env.ORIGIN || "http://localhost:5173"

const corsOptions = {
  origin, // frontend URL
  credentials: true // Allow cookies and authorization headers
}

app.use(express.static(path.join(__dirname, "public")))
app.use(morgan("dev"))
app.use(express.json())
app.use(cors(corsOptions))

app.get("/health", (_, res) => {
  res.status(200).send("OK")
})

app.use("/api/auth", authRouter) // Mount the auth router
app.use("/api/users", verifyAuth, usersRouter) // Mount the users router
app.use("/api/exercises", verifyAuth, exercisesRouter) // Mount the exercises router

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
