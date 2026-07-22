import { NextResponse } from "next/server";
import { listDir } from "@/lib/github";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const dir = searchParams.get("dir") || "";
  try {
    const items = await listDir(dir);
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
