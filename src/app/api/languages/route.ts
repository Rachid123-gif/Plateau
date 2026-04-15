import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ languages });
  } catch (error) {
    console.error("GET /api/languages:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
