import { Response } from "express"
import { devLog } from "./dev"

export const handleCatchResponse = (err: unknown, res: Response) => {
  devLog("Dev Error: ", err, "error")
  return res.status(500).json({ error: (err as unknown as Error).message })
}
