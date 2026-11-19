
import jwt from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret || !refreshSecret) {
  throw new Error("JWT secrets are missing in .env.local");
}

// Generate Access Token
export function generateAccessToken(userId: string) {
  return jwt.sign(
    { userId },
    accessSecret!,
    { expiresIn: "15m" }
  );
}

// Generate Refresh Token
export function generateRefreshToken(userId: string) {
  return jwt.sign(
    { userId },
    refreshSecret!,
    { expiresIn: "7d" }
  );
}

// Verify Access Token
export function verifyAccessToken(token: string) {
  return jwt.verify(token, accessSecret!);
}

// Verify Refresh Token
export function verifyRefreshToken(token: string) {
  return jwt.verify(token, refreshSecret!);
}


