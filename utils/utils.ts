import jwt from "jsonwebtoken";

const APP_SECRET = "your_app_secret";

interface TokenInterface {
  data: { userId: number; email: string; password: string };
  iat: number;
  exp: number;
}

export async function getUserIdByToken(req, userId) {
  if (req) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        if (token) {
          const decoded = (await jwt.verify(
            token,
            process.env.APP_SECRET
          )) as TokenInterface;
          userId = decoded.data.userId;
        }
      } catch {
        return null;
      }
    }
  }
  return userId;
}
