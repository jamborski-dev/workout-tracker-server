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
app.use(express.static(path.join(__dirname, "public")))
const port = process.env.PORT || 5001

const corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend URL
  credentials: true // Allows the server to accept cookies and authorization headers
}

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
