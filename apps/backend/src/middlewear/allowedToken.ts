import type { NextFunction, Request, Response } from "express"
import crypto from 'crypto';

const public_key = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0K5+Q0SL59PgBXUPIMEP
OogUHXKNGnO3CFz4Z9Xp9ZD2TkVW/KzGsdO2/9fPg8LykmkcUwYTkJitg+EOPtp8
oefiHym7thyPROVzhB/P1SVY4LuLKPjP5LpxFqan3JliF23A5IWk5iXj1Q9fGTYp
j7aGuTXoBfNPL34/U5HrihyP8e8x+2wVyMuXEC8JXy/ZKDc/ooIv77A6YMQdc2bv
Lb2Rj/3ChKCOWn/UM0cGyYHbePb8SAyvgtm/2hnQ/rhluoY+5JnsfOG1OqVV3h5V
9xArQCSdeIaCNnv9Gm/WdiMrvzNa73UPEqNDRe5uW7s7Rgziww6eOY70I08n1upK
nQIDAQAB
-----END PUBLIC KEY-----
`;

export async function allowedToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const timestamp = req.headers.timestamp;
  const signature = req.headers.signature;

  if(!timestamp || !signature || typeof timestamp !== 'string' || typeof signature !== 'string') {
    return res.status(401).json({ message: "Not Authenticated" })
  }

  const verify = crypto.createVerify('SHA256');
  verify.update(timestamp);
  verify.end();

  const isValid = verify.verify(public_key, signature, 'base64');

  const currentTime = Date.now();
  const oneMinute = 60 * 1000; 

  const timestampAge = currentTime - parseInt(timestamp, 10);

  if(isValid && timestampAge < oneMinute) {
    return next();
  }

  res.status(401).json({ message: "Not Authenticated" })
}
