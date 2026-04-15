"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";

export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Supprimer l'article "${title}" ? Cette action est irréversible.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/journal/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Erreur lors de la suppression.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-zinc-200 p-1.5 text-zinc-400 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
      aria-label="Supprimer"
    >
      <Trash weight="regular" className="h-4 w-4" />
    </button>
  );
}
