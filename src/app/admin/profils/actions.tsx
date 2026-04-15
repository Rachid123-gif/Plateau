"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function AdminProfileActions({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"verify" | "reject" | null>(null);

  const handleAction = async (action: "verify" | "reject") => {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/profiles/${profileId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erreur lors de l'action");
        return;
      }
      toast.success(
        action === "verify" ? "Profil vérifié avec succès" : "Profil rejeté"
      );
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="sm"
        disabled={loading !== null}
        onClick={() => handleAction("verify")}
        className="bg-green-600 hover:bg-green-700 gap-1"
      >
        {loading === "verify" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <CheckCircle2 className="h-3 w-3" />
        )}
        Vérifier
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={loading !== null}
        onClick={() => handleAction("reject")}
        className="border-red-300 text-red-600 hover:bg-red-50 gap-1"
      >
        {loading === "reject" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <XCircle className="h-3 w-3" />
        )}
        Rejeter
      </Button>
    </div>
  );
}
