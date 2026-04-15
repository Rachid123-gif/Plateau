"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye,
  EyeSlash,
  SpinnerGap,
  UserPlus,
  FilmSlate,
  Megaphone,
  GraduationCap,
} from "@phosphor-icons/react";
import { signUpSchema } from "@/lib/validations/auth";

type Role = "PROFESSIONAL" | "RECRUITER" | "INSTITUTION";

interface FormFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: string;
}

const ROLES: {
  value: Role;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "PROFESSIONAL",
    label: "Professionnel",
    description: "Acteur, réalisateur, technicien, etc.",
    icon: <FilmSlate weight="duotone" className="w-5 h-5" />,
  },
  {
    value: "RECRUITER",
    label: "Recruteur / Production",
    description: "Maison de production, casting director, etc.",
    icon: <Megaphone weight="duotone" className="w-5 h-5" />,
  },
  {
    value: "INSTITUTION",
    label: "Institution",
    description: "École de cinéma, association, organisme, etc.",
    icon: <GraduationCap weight="duotone" className="w-5 h-5" />,
  },
];

export default function InscriptionPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState<FormFields>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "PROFESSIONAL",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRoleSelect = (role: Role) => {
    setFields((prev) => ({ ...prev, role }));
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: undefined }));
    }
  };

  const validate = (): boolean => {
    const result = signUpSchema.safeParse(fields);
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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrors((prev) => ({
            ...prev,
            email: "Cette adresse email est déjà utilisée.",
          }));
          toast.error("Cette adresse email est déjà associée à un compte.");
        } else {
          toast.error(
            data.error ?? "Une erreur est survenue lors de l'inscription."
          );
        }
        return;
      }

      toast.success(
        "Inscription réussie ! Vérifiez votre email pour confirmer votre compte.",
        { duration: 6000 }
      );
      router.push("/connexion");
    } catch {
      toast.error("Une erreur inattendue est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      {/* Eyebrow */}
      <p className="text-xs uppercase tracking-[0.2em] font-mono text-amber-500 mb-3">
        // Rejoindre Plateau
      </p>

      {/* Heading */}
      <h1 className="text-3xl md:text-4xl tracking-[-0.04em] font-medium text-zinc-50 mb-2">
        Créer un compte
      </h1>
      <p className="text-sm text-zinc-400 mb-8">
        Déjà inscrit ?{" "}
        <Link
          href="/connexion"
          className="text-amber-500 hover:text-amber-400 transition-colors font-medium"
        >
          Se connecter
        </Link>
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Role selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.1em] font-mono text-zinc-500">
            Je suis un(e)
          </label>
          <div className="grid grid-cols-1 gap-3">
            {ROLES.map((role) => {
              const isSelected = fields.role === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => handleRoleSelect(role.value)}
                  disabled={isLoading}
                  aria-pressed={isSelected}
                  className={[
                    "flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 outline-none",
                    isSelected
                      ? "border-amber-500/50 bg-amber-500/5"
                      : "border-zinc-800 bg-zinc-900 hover:border-zinc-700",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors",
                      isSelected
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-zinc-800 text-zinc-500",
                    ].join(" ")}
                  >
                    {role.icon}
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span
                      className={`text-sm font-semibold leading-tight ${
                        isSelected ? "text-zinc-50" : "text-zinc-300"
                      }`}
                    >
                      {role.label}
                    </span>
                    <span
                      className={`text-xs leading-snug mt-0.5 ${
                        isSelected ? "text-amber-400/70" : "text-zinc-600"
                      }`}
                    >
                      {role.description}
                    </span>
                  </span>
                  <span
                    className={`ml-auto w-2 h-2 rounded-full shrink-0 transition-colors ${
                      isSelected ? "bg-amber-500" : "bg-zinc-800"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          {errors.role && (
            <p className="text-xs text-amber-500 mt-0.5">{errors.role}</p>
          )}
        </div>

        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="firstName" className="text-xs uppercase tracking-[0.1em] font-mono text-zinc-500">
              Prénom
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Prénom"
              value={fields.firstName}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-800 focus:border-amber-500/50 text-zinc-50 placeholder-zinc-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
              aria-invalid={!!errors.firstName}
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className="text-xs text-amber-500 mt-0.5">{errors.firstName}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lastName" className="text-xs uppercase tracking-[0.1em] font-mono text-zinc-500">
              Nom
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Nom de famille"
              value={fields.lastName}
              onChange={handleChange}
              className="bg-zinc-900 border border-zinc-800 focus:border-amber-500/50 text-zinc-50 placeholder-zinc-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
              aria-invalid={!!errors.lastName}
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="text-xs text-amber-500 mt-0.5">{errors.lastName}</p>
            )}
          </div>
        </div>

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
          <label htmlFor="password" className="text-xs uppercase tracking-[0.1em] font-mono text-zinc-500">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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
              aria-label={
                showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
              }
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeSlash className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p className="text-xs text-amber-500 mt-0.5">{errors.password}</p>
          ) : (
            <p className="text-xs text-zinc-600 mt-0.5">
              Au moins 8 caractères, une majuscule et un chiffre.
            </p>
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
              Création du compte…
            </>
          ) : (
            <>
              <UserPlus weight="bold" className="w-4 h-4" />
              Créer mon compte
            </>
          )}
        </button>

        {/* Terms */}
        <p className="text-center text-xs text-zinc-600 leading-relaxed -mt-1">
          En vous inscrivant, vous acceptez nos{" "}
          <Link href="/conditions" className="underline hover:text-zinc-400 transition-colors">
            conditions d&apos;utilisation
          </Link>{" "}
          et notre{" "}
          <Link href="/confidentialite" className="underline hover:text-zinc-400 transition-colors">
            politique de confidentialité
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
