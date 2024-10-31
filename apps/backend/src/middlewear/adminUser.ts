import type { NextFunction, Request, Response } from "express"

export async function adminUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const isAdmin = res.locals.session.user.isAdmin as boolean;

  if (isAdmin) {
    return next()
  }

  res.status(401).json({ message: "Not Allowed!" })
}
