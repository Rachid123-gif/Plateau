import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  // Ensure the redirect target is a relative path to prevent open redirects
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  const supabase = await createClient();

  // Handle PKCE code exchange (OAuth / email confirmation via code)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    console.error("[auth/callback] Code exchange error:", error.message);
    return NextResponse.redirect(
      `${origin}/connexion?error=${encodeURIComponent("La confirmation a échoué. Veuillez réessayer.")}`
    );
  }

  // Handle token hash (email confirmation, password reset, magic link)
  // Only email OTP types are valid for token_hash verification
  const EMAIL_OTP_TYPES: EmailOtpType[] = [
    "signup",
    "recovery",
    "invite",
    "magiclink",
    "email",
    "email_change",
  ];

  if (token_hash && type && EMAIL_OTP_TYPES.includes(type as EmailOtpType)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    console.error("[auth/callback] OTP verification error:", error.message);
    return NextResponse.redirect(
      `${origin}/connexion?error=${encodeURIComponent("Le lien est invalide ou a expiré.")}`
    );
  }

  // No valid parameters found
  return NextResponse.redirect(
    `${origin}/connexion?error=${encodeURIComponent("Lien de confirmation invalide.")}`
  );
}
