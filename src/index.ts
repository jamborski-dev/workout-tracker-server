import cors from "cors"
import express from "express"
import usersRouter from "./api/users"
import exercisesRouter from "./api/exercises" // Assuming you still need this router

const app = express()
const port = process.env.PORT || 5001

app.use(express.json())
app.use(cors())

app.use("/api/users", usersRouter) // Mount the users router
app.use("/api/exercises", exercisesRouter) // Mount the exercises router

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
