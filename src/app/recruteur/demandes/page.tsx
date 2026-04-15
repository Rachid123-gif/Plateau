"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, Send } from "lucide-react";

interface ContactRequest {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  respondedAt: string | null;
  receiver: {
    profile: {
      firstName: string;
      lastName: string;
      photoUrl: string | null;
      slug: string;
    } | null;
  };
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  PENDING: { label: "En attente", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  ACCEPTED: { label: "Acceptee", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  DECLINED: { label: "Refusee", icon: XCircle, color: "bg-red-100 text-red-800" },
};

export default function RecruteurDemandesPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contact-requests")
      .then((r) => r.json())
      .then((data) => setRequests(data.requests || []))
      .finally(() => setLoading(false));
  }, []);

  const filterByStatus = (status: string) =>
    requests.filter((r) => r.status === status);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes demandes</h1>
        <p className="text-gray-500 mt-1">
          Historique de vos demandes de contact
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            Toutes ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="PENDING">
            En attente ({filterByStatus("PENDING").length})
          </TabsTrigger>
          <TabsTrigger value="ACCEPTED">
            Acceptees ({filterByStatus("ACCEPTED").length})
          </TabsTrigger>
          <TabsTrigger value="DECLINED">
            Refusees ({filterByStatus("DECLINED").length})
          </TabsTrigger>
        </TabsList>

        {["all", "PENDING", "ACCEPTED", "DECLINED"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-3">
            {(tab === "all" ? requests : filterByStatus(tab)).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  Aucune demande
                </CardContent>
              </Card>
            ) : (
              (tab === "all" ? requests : filterByStatus(tab)).map((req) => {
                const config = STATUS_CONFIG[req.status];
                const StatusIcon = config?.icon ?? Send;
                return (
                  <Card key={req.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={req.receiver?.profile?.photoUrl ?? undefined}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-900 text-sm">
                              {req.receiver?.profile
                                ? `${req.receiver.profile.firstName[0]}${req.receiver.profile.lastName[0]}`
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">
                              {req.receiver?.profile
                                ? `${req.receiver.profile.firstName} ${req.receiver.profile.lastName}`
                                : "Utilisateur"}
                            </CardTitle>
                            <p className="text-xs text-gray-500">
                              {new Date(req.createdAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge className={config?.color ?? ""}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config?.label ?? req.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-sm">{req.subject}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {req.message}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
