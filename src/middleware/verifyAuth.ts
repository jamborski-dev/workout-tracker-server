import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { devLog } from "../utils/dev"

const JWT_SECRET = process.env.JWT_SECRET

// Middleware to verify access token
interface AuthenticatedRequest extends Request {
  user?: { userId: string }
}

// Middleware to verify access token
export const verifyAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!JWT_SECRET) {
    devLog("Missing JWT_SECRET in environment variables", undefined, "error")
    return res.status(500).send({ error: "Internal Server Error" })
  }

  const authHeader = req.headers.authorization
  if (!authHeader) {
    devLog("No authorization header")
    return res.status(401).send({ error: "Unauthorized" })
  }

  const token = authHeader.split(" ")[1]
  if (!token) {
    devLog("No token found in authorization header")
    return res.status(401).send({ error: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
    req.user = { userId: decoded.userId }
    next()
  } catch (err) {
    devLog("Error verifying token", err, "error")
    return res.status(403).send({ error: "Forbidden" })
  }
}
