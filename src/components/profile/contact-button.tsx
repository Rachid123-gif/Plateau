"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PaperPlaneRight, X } from "@phosphor-icons/react";

interface ContactButtonProps {
  receiverId: string;
  receiverName: string;
  currentUserRole: string | null;
  profileSlug: string;
}

/**
 * Modal de contact pour envoyer une demande au professionnel.
 * Non connecté → redirect vers /connexion
 * Connecté (non professionnel ciblé) → ouvre modal avec form
 */
export function ContactButton({
  receiverId,
  receiverName,
  currentUserRole,
  profileSlug,
}: ContactButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (!currentUserRole) {
      router.push(`/connexion?redirect=/profil/${profileSlug}`);
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.length < 3 || message.length < 10) {
      toast.error("Objet (3+ car.) et message (10+ car.) requis");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, subject, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erreur lors de l'envoi");
      }
      toast.success("Demande envoyée avec succès");
      setOpen(false);
      setSubject("");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-[1px] shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_20px_40px_-15px_rgba(245,158,11,0.35)]"
      >
        <PaperPlaneRight weight="fill" className="w-4 h-4" />
        {currentUserRole ? "Demander un contact" : "Se connecter pour contacter"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/85 backdrop-blur-md p-4"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 lg:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => !loading && setOpen(false)}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:text-zinc-50 hover:bg-zinc-800 transition-colors"
            >
              <X weight="bold" className="w-4 h-4" />
            </button>

            <div className="eyebrow mb-3">// Nouvelle demande</div>
            <h2 className="text-2xl font-medium tracking-tight mb-1">
              Contacter{" "}
              <span className="font-editorial text-amber-500 italic">
                {receiverName}
              </span>
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Présentez votre projet. Une réponse est généralement donnée sous 48h.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] font-mono text-zinc-500 mb-2">
                  Objet
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex. Casting court-métrage, rôle principal"
                  className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 text-zinc-50 placeholder-zinc-600 rounded-xl px-4 text-sm outline-none transition-colors"
                  maxLength={200}
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] font-mono text-zinc-500 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre projet, le rôle, les dates de tournage, etc."
                  rows={6}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 text-zinc-50 placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none"
                  maxLength={2000}
                  disabled={loading}
                  required
                />
                <p className="mt-1 text-[10px] font-mono text-zinc-600 text-right tabular-nums">
                  {message.length}/2000
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !loading && setOpen(false)}
                  className="flex-1 inline-flex items-center justify-center rounded-full border border-zinc-700 hover:border-zinc-500 text-zinc-50 px-5 py-3 text-sm font-medium transition-colors"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-950 px-5 py-3 text-sm font-semibold transition-colors"
                >
                  {loading ? (
                    "Envoi..."
                  ) : (
                    <>
                      <PaperPlaneRight weight="fill" className="w-4 h-4" />
                      Envoyer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
