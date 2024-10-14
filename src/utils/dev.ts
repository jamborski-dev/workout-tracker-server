export const devLog = (message: string, value?: any, type: "log" | "error" | "info" = "log") => {
  if (process.env.NODE_ENV === "development") {
    console[type]("Dev log: ", message, value)
  }
}
