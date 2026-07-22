import { NextResponse } from "next/server";
import { getFile, putFile } from "@/lib/github";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "path required" }, { status: 400 });
  }
  try {
    const file = await getFile(path);
    if (!file) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(file);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const { path, content, message, sha } = await req.json();
  if (!path || content === undefined) {
    return NextResponse.json(
      { error: "path and content required" },
      { status: 400 }
    );
  }
  try {
    const result = await putFile(
      path,
      content,
      message || `Update ${path} via dashboard`,
      sha
    );
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
