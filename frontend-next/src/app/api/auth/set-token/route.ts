import { NextResponse } from "next/server";

// POST /api/auth/set-token — sets the JWT cookie for SSR and client access
export async function POST(request: Request) {
  try {
    const { token } = await request.json() as { token: string };

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true, message: "Token enregistré" });

    response.cookies.set("coflow_token", token, {
      httpOnly: false, // allow both middleware and client-side authorization
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur interne" }, { status: 500 });
  }
}
