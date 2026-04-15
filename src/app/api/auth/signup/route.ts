import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { signUpSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = signUpSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Donnees invalides.",
          details: result.error.issues.map((i) => ({
            field: i.path[0],
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, role } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cette adresse email est deja utilisee." },
        { status: 409 }
      );
    }

    // Sign up via Supabase Auth (standard, no service role needed)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      },
    });

    if (authError || !authData.user) {
      if (authError?.message?.includes("already registered")) {
        return NextResponse.json(
          { error: "Cette adresse email est deja utilisee." },
          { status: 409 }
        );
      }
      console.error("[signup] Supabase auth error:", authError);
      return NextResponse.json(
        { error: "Erreur lors de la creation du compte." },
        { status: 500 }
      );
    }

    // Generate unique slug
    const baseSlug = slugify(`${firstName} ${lastName}`, {
      lower: true,
      strict: true,
      locale: "fr",
    });

    let slug = baseSlug;
    const existingProfile = await prisma.profile.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingProfile) {
      const suffix = Math.random().toString(36).slice(2, 7);
      slug = `${baseSlug}-${suffix}`;
    }

    // Create User + Profile in DB
    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            supabaseId: authData.user!.id,
            role: role as "PROFESSIONAL" | "RECRUITER" | "INSTITUTION",
          },
        });

        await tx.profile.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            slug,
          },
        });
      });
    } catch (dbError) {
      console.error("[signup] DB error:", dbError);
      return NextResponse.json(
        { error: "Erreur lors de la creation du profil." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Compte cree avec succes. Verifiez votre email pour confirmer votre inscription.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[signup] Unexpected error:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}
