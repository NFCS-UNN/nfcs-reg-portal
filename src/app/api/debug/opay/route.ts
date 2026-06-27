import { NextResponse } from "next/server";
import { getOPayEnvironmentDiagnostics } from "@/lib/opay";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function readToken(req: Request) {
  const url = new URL(req.url);
  return req.headers.get("x-debug-token") || url.searchParams.get("token");
}

export async function GET(req: Request) {
  const expectedToken = process.env.OPAY_DEBUG_TOKEN?.trim();
  const suppliedToken = readToken(req)?.trim();

  if (!expectedToken || suppliedToken !== expectedToken) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    diagnostics: getOPayEnvironmentDiagnostics(),
  });
}
