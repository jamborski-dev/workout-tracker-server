import express from "express"

import userRouter from "./user"
import routinesRouter from "./routines"
import movementsRouter from "./movements"
import setsRouter from "./sets"
import exercisesRouter from "./exercises"

const router = express.Router()

router.use("/user", userRouter)
router.use("/routines", routinesRouter)
router.use("/routines/:routineId/movements", movementsRouter)
router.use("/routines/:routineId/movements/:movementId/sets", setsRouter)
router.use("/exercises", exercisesRouter)

export default router
