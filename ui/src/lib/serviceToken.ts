import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

export type ServiceTokenClaims = {
  iss: "nextjs-bff";
  aud: "fastapi";
  sub: string;        // user id (or "system" for non-user routes)
};

export function signServiceToken(sub: string): string {
  const claims: ServiceTokenClaims = {
    iss: "nextjs-bff",
    aud: "fastapi",
    sub,
  };

  return jwt.sign(claims, SECRET, {
    algorithm: "HS256",
    expiresIn: "60s",
  });
}