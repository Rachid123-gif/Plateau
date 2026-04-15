"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { SpinnerGap, EnvelopeSimple, CaretLeft, PaperPlaneRight } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/lib/validations/auth";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = resetPasswordSchema.safeParse({ email });
    if (!result.success) {
      setEmailError(result.error.issues[0]?.message ?? "Email invalide");
      return;
    }
    setEmailError(undefined);

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/reinitialisation-mot-de-passe`,
      });

      if (error) {
        toast.error("Une erreur est survenue. Veuillez réessayer.");
        return;
      }

      setIsSent(true);
      toast.success("Email envoyé ! Consultez votre boîte de réception.");
    } catch {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 mx-auto mb-6">
          <EnvelopeSimple weight="thin" className="w-10 h-10 text-amber-500" />
        </div>

        <p className="text-xs uppercase tracking-[0.2em] font-mono text-amber-500 mb-3">
          // Email envoyé
        </p>
        <h2 className="text-3xl tracking-[-0.03em] font-medium text-zinc-50 mb-3">
          Vérifiez votre boîte mail
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto mb-8">
          Si un compte est associé à{" "}
          <span className="text-zinc-50 font-medium">{email}</span>, vous
          recevrez un lien de réinitialisation dans quelques minutes.
        </p>
        <p className="text-xs text-zinc-600 mb-8">
          Pensez à vérifier vos spams si vous ne voyez pas l&apos;email.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setIsSent(false);
              setEmail("");
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-5 py-3 text-sm transition-colors"
          >
            <PaperPlaneRight weight="bold" className="w-4 h-4" />
            Renvoyer un email
          </button>
          <Link
            href="/connexion"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-transparent text-zinc-50 px-5 py-3 text-sm transition-colors"
          >
            <CaretLeft weight="bold" className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Eyebrow */}
      <p className="text-xs uppercase tracking-[0.2em] font-mono text-amber-500 mb-3">
        // Sécurité du compte
      </p>

      {/* Heading */}
      <h1 className="text-3xl md:text-4xl tracking-[-0.04em] font-medium text-zinc-50 mb-2">
        Réinitialiser le mot de passe
      </h1>
      <p className="text-sm text-zinc-400 mb-8">
        Saisissez votre adresse email pour recevoir un lien de réinitialisation.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs uppercase tracking-[0.1em] font-mono text-zinc-500">
            Adresse email
          </label>
          <div className="relative">
            <EnvelopeSimple
              weight="bold"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="votre@email.com"
              value={email}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/50 text-zinc-50 placeholder-zinc-500 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-colors"
              aria-invalid={!!emailError}
              disabled={isLoading}
            />
          </div>
          {emailError && (
            <p className="text-xs text-amber-500 mt-0.5">{emailError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-5 py-3 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <SpinnerGap className="w-4 h-4 animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>
              <PaperPlaneRight weight="bold" className="w-4 h-4" />
              Envoyer le lien
            </>
          )}
        </button>
      </form>

      {/* Back link */}
      <div className="mt-6 text-center">
        <Link
          href="/connexion"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <CaretLeft weight="bold" className="w-3.5 h-3.5" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
