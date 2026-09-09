import { NextResponse } from "next/server";

// POST /api/auth/logout — clears the JWT cookie
export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("coflow_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // expire immediately
    path: "/",
  });
  return response;
}
