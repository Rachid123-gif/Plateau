"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type AvailabilityStatus = "AVAILABLE" | "BUSY" | "UNAVAILABLE";

type AvailabilitySlot = {
  id: string;
  startDate: string;
  endDate: string;
  status: AvailabilityStatus;
  note: string | null;
};

const STATUS_CONFIG: Record<
  AvailabilityStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  AVAILABLE: {
    label: "Disponible",
    color: "text-green-700",
    bg: "bg-green-100",
    icon: CheckCircle2,
  },
  BUSY: {
    label: "Occupé",
    color: "text-amber-700",
    bg: "bg-amber-100",
    icon: Clock,
  },
  UNAVAILABLE: {
    label: "Indisponible",
    color: "text-red-700",
    bg: "bg-red-100",
    icon: XCircle,
  },
};

export default function AgendaPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [globalStatus, setGlobalStatus] = useState<AvailabilityStatus>("AVAILABLE");
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [addingSlot, setAddingSlot] = useState(false);

  const [newSlot, setNewSlot] = useState({
    startDate: "",
    endDate: "",
    status: "AVAILABLE" as AvailabilityStatus,
    note: "",
  });

  const loadData = useCallback(async () => {
    try {
      const [slotsRes, profileRes] = await Promise.all([
        fetch("/api/availability"),
        fetch("/api/profiles/me"),
      ]);
      if (slotsRes.ok) {
        const data = await slotsRes.json();
        setSlots(data.slots ?? []);
      }
      if (profileRes.ok) {
        const data = await profileRes.json();
        if (data.profile?.availabilityStatus) {
          setGlobalStatus(data.profile.availabilityStatus);
        }
      }
    } catch {
      toast.error("Erreur lors du chargement des disponibilités");
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (status: AvailabilityStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch("/api/profiles/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilityStatus: status }),
      });
      if (!res.ok) throw new Error();
      setGlobalStatus(status);
      toast.success("Statut mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot.startDate || !newSlot.endDate) {
      toast.error("Veuillez renseigner les dates de début et de fin");
      return;
    }
    if (new Date(newSlot.startDate) >= new Date(newSlot.endDate)) {
      toast.error("La date de début doit être antérieure à la date de fin");
      return;
    }
    setAddingSlot(true);
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: new Date(newSlot.startDate).toISOString(),
          endDate: new Date(newSlot.endDate).toISOString(),
          status: newSlot.status,
          note: newSlot.note || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erreur lors de l'ajout");
        return;
      }
      toast.success("Créneau ajouté avec succès");
      setNewSlot({ startDate: "", endDate: "", status: "AVAILABLE", note: "" });
      loadData();
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const res = await fetch(`/api/availability/${slotId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      toast.success("Créneau supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const currentCfg = STATUS_CONFIG[globalStatus];
  const CurrentIcon = currentCfg.icon;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-blue-900">Disponibilité</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez votre statut de disponibilité et vos créneaux.
        </p>
      </div>

      {/* Quick status toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statut actuel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${currentCfg.bg}`}>
            <CurrentIcon className={`h-5 w-5 ${currentCfg.color}`} />
            <span className={`font-semibold ${currentCfg.color}`}>{currentCfg.label}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_CONFIG) as AvailabilityStatus[]).map((status) => {
              const cfg = STATUS_CONFIG[status];
              const Icon = cfg.icon;
              return (
                <Button
                  key={status}
                  variant={globalStatus === status ? "default" : "outline"}
                  size="sm"
                  disabled={updatingStatus || globalStatus === status}
                  onClick={() => handleStatusChange(status)}
                  className={
                    globalStatus === status
                      ? "bg-blue-900 hover:bg-blue-800"
                      : ""
                  }
                >
                  {updatingStatus && globalStatus !== status ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4 mr-2" />
                  )}
                  {cfg.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add slot form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ajouter un créneau</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSlot} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={newSlot.startDate}
                  onChange={(e) =>
                    setNewSlot((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={newSlot.endDate}
                  onChange={(e) =>
                    setNewSlot((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slotStatus">Statut</Label>
                <Select
                  value={newSlot.status}
                  onValueChange={(v) =>
                    setNewSlot((prev) => ({ ...prev, status: v as AvailabilityStatus }))
                  }
                >
                  <SelectTrigger id="slotStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_CONFIG) as AvailabilityStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_CONFIG[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (optionnel)</Label>
                <Input
                  id="note"
                  value={newSlot.note}
                  onChange={(e) =>
                    setNewSlot((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Ex: Tournage à Marrakech"
                  maxLength={200}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={addingSlot}
              className="bg-blue-900 hover:bg-blue-800 gap-2"
            >
              {addingSlot ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Ajouter le créneau
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Slots list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Créneaux planifiés ({slots.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSlots ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-900" />
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Aucun créneau planifié. Ajoutez des créneaux pour indiquer vos disponibilités.
            </p>
          ) : (
            <ul className="space-y-3">
              {slots.map((slot, i) => {
                const cfg = STATUS_CONFIG[slot.status];
                const Icon = cfg.icon;
                return (
                  <li key={slot.id}>
                    {i > 0 && <Separator className="mb-3" />}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-full p-1.5 ${cfg.bg} mt-0.5`}>
                          <Icon className={`h-4 w-4 ${cfg.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${cfg.color} border-current`}
                            >
                              {cfg.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            {format(new Date(slot.startDate), "dd MMM yyyy, HH:mm", {
                              locale: fr,
                            })}{" "}
                            &rarr;{" "}
                            {format(new Date(slot.endDate), "dd MMM yyyy, HH:mm", {
                              locale: fr,
                            })}
                          </p>
                          {slot.note && (
                            <p className="text-xs text-gray-500 mt-0.5">{slot.note}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500 h-8 w-8 shrink-0"
                        onClick={() => handleDeleteSlot(slot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
