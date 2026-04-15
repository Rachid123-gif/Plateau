"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type ContactRequest = {
  id: string;
  subject: string;
  message: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  createdAt: string;
  sender: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      photoUrl: string | null;
      slug: string;
    } | null;
  };
};

const STATUS_CONFIG = {
  PENDING: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  ACCEPTED: {
    label: "Acceptée",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
  },
  DECLINED: {
    label: "Refusée",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  EXPIRED: {
    label: "Expirée",
    color: "bg-gray-100 text-gray-600",
    icon: Clock,
  },
};

function RequestCard({
  request,
  onAccept,
  onDecline,
}: {
  request: ContactRequest;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(false);

  const cfg = STATUS_CONFIG[request.status];
  const Icon = cfg.icon;

  const senderName = request.sender.profile
    ? `${request.sender.profile.firstName} ${request.sender.profile.lastName}`
    : request.sender.email;

  const initials = request.sender.profile
    ? `${request.sender.profile.firstName[0]}${request.sender.profile.lastName[0]}`
    : request.sender.email[0].toUpperCase();

  const handleAccept = async () => {
    setActing(true);
    await onAccept(request.id);
    setActing(false);
  };

  const handleDecline = async () => {
    setActing(true);
    await onDecline(request.id);
    setActing(false);
  };

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={request.sender.profile?.photoUrl ?? undefined} />
            <AvatarFallback className="bg-blue-100 text-blue-900 text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="text-sm font-semibold">{senderName}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(request.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}
              >
                <Icon className="h-3 w-3" />
                {cfg.label}
              </span>
            </div>

            <p className="mt-2 text-sm font-medium">{request.subject}</p>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs text-blue-900 hover:underline mt-1"
            >
              {expanded ? (
                <>
                  Masquer le message <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Lire le message <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>

            {expanded && (
              <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-line">
                {request.message}
              </div>
            )}

            {request.status === "PENDING" && (
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  disabled={acting}
                  onClick={handleAccept}
                  className="bg-green-600 hover:bg-green-700 gap-1"
                >
                  {acting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                  Accepter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={acting}
                  onClick={handleDecline}
                  className="border-red-300 text-red-600 hover:bg-red-50 gap-1"
                >
                  {acting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  Décliner
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DemandesPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const loadRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/contact-requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests ?? []);
      }
    } catch {
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAccept = async (id: string) => {
    try {
      const res = await fetch(`/api/contact-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });
      if (!res.ok) throw new Error();
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "ACCEPTED" } : r))
      );
      toast.success("Demande acceptée");
    } catch {
      toast.error("Erreur lors de l'acceptation");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      const res = await fetch(`/api/contact-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DECLINED" }),
      });
      if (!res.ok) throw new Error();
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "DECLINED" } : r))
      );
      toast.success("Demande déclinée");
    } catch {
      toast.error("Erreur lors du refus");
    }
  };

  const filterOptions = [
    { value: "ALL", label: "Toutes" },
    { value: "PENDING", label: "En attente" },
    { value: "ACCEPTED", label: "Acceptées" },
    { value: "DECLINED", label: "Refusées" },
  ];

  const filtered =
    filter === "ALL" ? requests : requests.filter((r) => r.status === filter);

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Demandes de contact
          {pendingCount > 0 && (
            <Badge className="bg-red-500 text-white">{pendingCount}</Badge>
          )}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les demandes de contact reçues des recruteurs et partenaires.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={filter === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(opt.value)}
            className={filter === opt.value ? "bg-blue-900 hover:bg-blue-800" : ""}
          >
            {opt.label}
            {opt.value === "PENDING" && pendingCount > 0 && (
              <Badge className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0">
                {pendingCount}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <Separator />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Aucune demande</p>
          <p className="text-sm mt-1">
            {filter === "ALL"
              ? "Vous n'avez pas encore reçu de demande de contact."
              : `Aucune demande avec le statut « ${filterOptions.find((o) => o.value === filter)?.label} ».`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </div>
      )}
    </div>
  );
}
