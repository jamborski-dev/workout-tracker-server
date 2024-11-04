import { Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { devLog } from "../utils/dev"
import { AuthenticatedRequest } from "../types/request"

const JWT_SECRET = process.env.JWT_SECRET

export const verifyAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!JWT_SECRET) {
    devLog("Missing JWT_SECRET in environment variables", undefined, "error")
    return res.status(500).send({ error: "Internal Server Error" })
  }

  // Get the accessToken from cookies
  const token = req.cookies.accessToken

  if (!token) {
    devLog("No accessToken cookie found")
    return res.status(401).send({ error: "Unauthorized" })
  }

  try {
    // Verify the JWT using the secret
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload

    // Attach the userId to req object
    req.userId = decoded.userId
    next()
  } catch (err) {
    devLog("Error verifying token", err, "error")
    return res.status(403).send({ error: "Forbidden" })
  }
}
