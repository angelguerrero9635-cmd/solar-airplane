import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = await req.json();
  if (password && password === process.env.DASHBOARD_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("glider_auth", "ok", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
