"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeSlash, SpinnerGap, SignIn } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { signInSchema } from "@/lib/validations/auth";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function ConnexionPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const result = signInSchema.safeParse(fields);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: fields.email,
        password: fields.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou mot de passe incorrect.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error(
            "Veuillez confirmer votre adresse email avant de vous connecter."
          );
        } else {
          toast.error("Une erreur est survenue. Veuillez réessayer.");
        }
        return;
      }

      toast.success("Connexion réussie !");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Eyebrow */}
      <p className="text-xs uppercase tracking-[0.2em] font-mono text-amber-500 mb-3">
        // Accès plateforme
      </p>

      {/* Heading */}
      <h1 className="text-3xl md:text-4xl tracking-[-0.04em] font-medium text-zinc-50 mb-2">
        Connexion
      </h1>
      <p className="text-sm text-zinc-400 mb-8">
        Pas encore de compte ?{" "}
        <Link
          href="/inscription"
          className="text-amber-500 hover:text-amber-400 transition-colors font-medium"
        >
          Créer un compte
        </Link>
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs uppercase tracking-[0.1em] font-mono text-zinc-500">
            Adresse email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="votre@email.com"
            value={fields.email}
            onChange={handleChange}
            className="bg-zinc-900 border border-zinc-800 focus:border-amber-500/50 text-zinc-50 placeholder-zinc-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
            aria-invalid={!!errors.email}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-xs text-amber-500 mt-0.5">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs uppercase tracking-[0.1em] font-mono text-zinc-500">
              Mot de passe
            </label>
            <Link
              href="/mot-de-passe-oublie"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={fields.password}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/50 text-zinc-50 placeholder-zinc-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors pr-11"
              aria-invalid={!!errors.password}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeSlash className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-amber-500 mt-0.5">{errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-5 py-3 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {isLoading ? (
            <>
              <SpinnerGap className="w-4 h-4 animate-spin" />
              Connexion en cours…
            </>
          ) : (
            <>
              <SignIn weight="bold" className="w-4 h-4" />
              Se connecter
            </>
          )}
        </button>
      </form>
    </div>
  );
}
