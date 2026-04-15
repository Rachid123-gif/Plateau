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
import { Separator } from "@/components/ui/separator";
import { Briefcase, Plus, Pencil, Power, Loader2, ChevronDown, ChevronUp } from "lucide-react";

type Profession = {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  isActive: boolean;
  sortOrder: number;
};

type ProfessionCategory = {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  professions: Profession[];
};

type FormState = {
  name: string;
  nameAr: string;
  categoryId: string;
  sortOrder: string;
};

const EMPTY_FORM: FormState = { name: "", nameAr: "", categoryId: "", sortOrder: "0" };

export default function MetiersPage() {
  const [categories, setCategories] = useState<ProfessionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfession, setEditingProfession] = useState<Profession | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/professions");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories ?? []);
        // Expand all categories by default
        const exp: Record<string, boolean> = {};
        (data.categories ?? []).forEach((c: ProfessionCategory) => {
          exp[c.id] = true;
        });
        setExpanded(exp);
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
    setEditingProfession(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? "" });
    setDialogOpen(true);
  };

  const openEdit = (profession: Profession, categoryId: string) => {
    setEditingProfession(profession);
    setForm({
      name: profession.name,
      nameAr: profession.nameAr ?? "",
      categoryId,
      sortOrder: String(profession.sortOrder),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingProfession
        ? `/api/admin/professions/${editingProfession.id}`
        : "/api/admin/professions";
      const method = editingProfession ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          nameAr: form.nameAr || null,
          categoryId: form.categoryId,
          sortOrder: parseInt(form.sortOrder) || 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erreur lors de la sauvegarde");
        return;
      }
      toast.success(editingProfession ? "Métier modifié" : "Métier ajouté");
      setDialogOpen(false);
      loadData();
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (profession: Profession) => {
    try {
      const res = await fetch(`/api/admin/professions/${profession.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !profession.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(profession.isActive ? "Métier désactivé" : "Métier activé");
      loadData();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpanded((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const totalProfessions = categories.reduce((acc, c) => acc + c.professions.length, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Métiers du cinéma
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalProfessions} métier{totalProfessions !== 1 ? "s" : ""} dans{" "}
            {categories.length} catégorie{categories.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openAdd} className="bg-blue-900 hover:bg-blue-800 gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un métier
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-500">
            Aucune catégorie de métier trouvée.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardHeader className="pb-2">
                <button
                  type="button"
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => toggleCategory(cat.id)}
                >
                  <div>
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                    {cat.nameAr && (
                      <p className="text-xs text-gray-500 mt-0.5 font-arabic" dir="rtl">
                        {cat.nameAr}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{cat.professions.length}</Badge>
                    {expanded[cat.id] ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>
              </CardHeader>
              {expanded[cat.id] && (
                <CardContent>
                  <Separator className="mb-3" />
                  {cat.professions.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Aucun métier dans cette catégorie.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {cat.professions.map((p) => (
                        <li
                          key={p.id}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-sm font-medium ${
                                p.isActive ? "text-gray-900" : "text-gray-400 line-through"
                              }`}
                            >
                              {p.name}
                            </span>
                            {p.nameAr && (
                              <span className="text-xs text-gray-500" dir="rtl">
                                {p.nameAr}
                              </span>
                            )}
                            {!p.isActive && (
                              <Badge variant="secondary" className="text-xs">
                                Inactif
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-400 hover:text-blue-900"
                              onClick={() => openEdit(p, cat.id)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-7 w-7 ${
                                p.isActive
                                  ? "text-gray-400 hover:text-red-500"
                                  : "text-gray-400 hover:text-green-600"
                              }`}
                              onClick={() => handleToggleActive(p)}
                              title={p.isActive ? "Désactiver" : "Activer"}
                            >
                              <Power className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProfession ? "Modifier le métier" : "Ajouter un métier"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="profName">Nom (français) *</Label>
              <Input
                id="profName"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                placeholder="Ex: Chef opérateur"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profNameAr">Nom (arabe)</Label>
              <Input
                id="profNameAr"
                value={form.nameAr}
                onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))}
                dir="rtl"
                placeholder="الاسم بالعربية"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profCategory">Catégorie *</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((p) => ({ ...p, categoryId: v as string }))}
              >
                <SelectTrigger id="profCategory">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Ordre d&apos;affichage</Label>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-900 hover:bg-blue-800"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProfession ? "Enregistrer" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
