import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-500">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Logo size="md" />
            <p className="text-sm text-zinc-500 leading-relaxed">
              Le plateau des professionnels du cinéma et de l&apos;audiovisuel au Maroc.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-mono text-amber-500 mb-4">
              Plateforme
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/annuaire" className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors">
                  Annuaire
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors">
                  Créer un profil
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors">
                  Espace recruteur
                </Link>
              </li>
            </ul>
          </div>

          {/* Partenaires */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-mono text-amber-500 mb-4">
              Partenaires
            </h3>
            <ul className="space-y-2">
              {["CCM", "ISADAC", "ISMAC", "ESAV Marrakech", "SNRT", "2M"].map((inst) => (
                <li key={inst}>
                  <span className="text-sm text-zinc-500">{inst}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-mono text-amber-500 mb-4">
              Légal
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-zinc-500">Conditions d&apos;utilisation</span>
              </li>
              <li>
                <span className="text-sm text-zinc-500">Politique de confidentialité</span>
              </li>
              <li>
                <span className="text-sm text-zinc-500">Mentions légales</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-zinc-800">
          <p className="text-center text-sm text-zinc-600 font-mono">
            &copy; {new Date().getFullYear()} Plateau — Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
