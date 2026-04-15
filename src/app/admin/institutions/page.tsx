"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Plus, Pencil, Power, Loader2 } from "lucide-react";

type Institution = {
  id: string;
  name: string;
  type: string;
  city: string | null;
  website: string | null;
  isActive: boolean;
};

const INSTITUTION_TYPES = [
  { value: "SCHOOL", label: "École" },
  { value: "UNIVERSITY", label: "Université" },
  { value: "ORGANIZATION", label: "Organisation" },
  { value: "ASSOCIATION", label: "Association" },
  { value: "OTHER", label: "Autre" },
];

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  INSTITUTION_TYPES.map((t) => [t.value, t.label])
);

type FormState = {
  name: string;
  type: string;
  city: string;
  website: string;
};

const EMPTY_FORM: FormState = { name: "", type: "SCHOOL", city: "", website: "" };

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/institutions");
      if (res.ok) {
        const data = await res.json();
        setInstitutions(data.institutions ?? []);
      }
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAdd = () => {
    setEditingInstitution(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (institution: Institution) => {
    setEditingInstitution(institution);
    setForm({
      name: institution.name,
      type: institution.type,
      city: institution.city ?? "",
      website: institution.website ?? "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingInstitution
        ? `/api/admin/institutions/${editingInstitution.id}`
        : "/api/admin/institutions";
      const method = editingInstitution ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          city: form.city || null,
          website: form.website || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erreur lors de la sauvegarde");
        return;
      }
      toast.success(editingInstitution ? "Institution modifiée" : "Institution ajoutée");
      setDialogOpen(false);
      loadData();
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (institution: Institution) => {
    try {
      const res = await fetch(`/api/admin/institutions/${institution.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !institution.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(institution.isActive ? "Institution désactivée" : "Institution activée");
      loadData();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const filtered = institutions.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Institutions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {institutions.length} institution{institutions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openAdd} className="bg-blue-900 hover:bg-blue-800 gap-2">
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">Liste des institutions</CardTitle>
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs ml-auto"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Aucune institution trouvée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Site web</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell className="font-medium">{inst.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {TYPE_LABELS[inst.type] ?? inst.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {inst.city ?? <span className="text-gray-400">—</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {inst.website ? (
                        <a
                          href={inst.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-900 hover:underline truncate max-w-[160px] block"
                        >
                          {inst.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          inst.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {inst.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-blue-900"
                          onClick={() => openEdit(inst)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${
                            inst.isActive
                              ? "text-gray-400 hover:text-red-500"
                              : "text-gray-400 hover:text-green-600"
                          }`}
                          onClick={() => handleToggleActive(inst)}
                          title={inst.isActive ? "Désactiver" : "Activer"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInstitution ? "Modifier l'institution" : "Ajouter une institution"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="instName">Nom *</Label>
              <Input
                id="instName"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                placeholder="Ex: ESAV Marrakech"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instType">Type *</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((p) => ({ ...p, type: v as string }))}
              >
                <SelectTrigger id="instType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INSTITUTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instCity">Ville</Label>
                <Input
                  id="instCity"
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="Casablanca"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instWebsite">Site web</Label>
                <Input
                  id="instWebsite"
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-900 hover:bg-blue-800"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingInstitution ? "Enregistrer" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
