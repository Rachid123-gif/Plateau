import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: "asc" },
      include: { category: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ skills });
  } catch (error) {
    console.error("GET /api/skills:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
