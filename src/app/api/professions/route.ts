import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.professionCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        professions: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/professions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
