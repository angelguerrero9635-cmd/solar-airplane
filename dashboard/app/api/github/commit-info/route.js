import { NextResponse } from "next/server";
import { getLatestCommit } from "@/lib/github";

export async function GET() {
  try {
    const commit = await getLatestCommit();
    if (!commit) {
      return NextResponse.json({ error: "unavailable" }, { status: 500 });
    }
    return NextResponse.json(commit);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
