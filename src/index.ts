import cors from "cors"
import express from "express"
import usersRouter from "./api/users"
import exercisesRouter from "./api/exercises" // Assuming you still need this router
import authRouter from "./api/auth"
import { verifyAuth } from "./middleware/verifyAuth"
import morgan from "morgan"
import path from "path"
import https from "https"
import fs from "fs"
import http from "http"

require("dotenv").config()

const app = express()

const port = process.env.PORT || 5001
const origin = process.env.ORIGIN || "https://localhost:5173"

const corsOptions = {
  origin, // frontend URL
  credentials: true // Allow cookies and authorization headers
}

app.use("*", cors(corsOptions))

app.use(express.static(path.join(__dirname, "public")))
app.use(morgan("dev"))
app.use(express.json())

// Health check route
app.get("/health", (_, res) => {
  res.status(200).send("OK")
})

// Mounting API routes
app.use("/api/auth", authRouter)
app.use("/api/users", verifyAuth, usersRouter)
app.use("/api/exercises", verifyAuth, exercisesRouter)

// Conditional HTTPS/HTTP server setup based on NODE_ENV
if (process.env.NODE_ENV === "development") {
  const serverConfig = {
    key: fs.readFileSync("certs/localhost+2-key.pem"),
    cert: fs.readFileSync("certs/localhost+2.pem")
  }

  https.createServer(serverConfig, app).listen(port, () => {
    console.log(`HTTPS server running on https://localhost:${port}`)
  })
} else {
  http.createServer(app).listen(port, () => {
    console.log(`HTTP server running on http://localhost:${port}`)
  })
}
