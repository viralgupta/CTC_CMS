import { getSession } from "@auth/express"
import type { NextFunction, Request, Response } from "express"
import AuthConfig from "@auth/auth.config"
import { Config } from "sst/node/config"

export async function authenticatedUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  process.env.AUTH_SECRET = Config.AUTH_SECRET;
  const session = res.locals.session ?? (await getSession(req, AuthConfig)) ?? undefined

  res.locals.session = session

  if (session || process.env.SST_STAGE === "dev") {
    return next()
  }

  res.status(401).json({ message: "Not Authenticated" })
}
