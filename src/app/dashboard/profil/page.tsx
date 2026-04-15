"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Camera, X, Plus, Save, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type Profession = { id: string; name: string; categoryId: string };
type ProfessionCategory = { id: string; name: string; professions: Profession[] };
type Skill = { id: string; name: string };
type Language = { id: string; name: string; code: string };

const EXPERIENCE_LEVELS = [
  { value: "STUDENT", label: "Étudiant" },
  { value: "JUNIOR", label: "Junior (0-2 ans)" },
  { value: "INTERMEDIATE", label: "Intermédiaire (2-5 ans)" },
  { value: "SENIOR", label: "Senior (5-10 ans)" },
  { value: "EXPERT", label: "Expert (10+ ans)" },
];

const LANGUAGE_LEVELS = [
  { value: "NATIVE", label: "Langue maternelle" },
  { value: "FLUENT", label: "Courant" },
  { value: "CONVERSATIONAL", label: "Conversationnel" },
  { value: "BASIC", label: "Bases" },
];

const MOROCCAN_REGIONS = [
  "Tanger-Tétouan-Al Hoceïma",
  "Oriental",
  "Fès-Meknès",
  "Rabat-Salé-Kénitra",
  "Béni Mellal-Khénifra",
  "Casablanca-Settat",
  "Marrakech-Safi",
  "Drâa-Tafilalet",
  "Souss-Massa",
  "Guelmim-Oued Noun",
  "Laâyoune-Sakia El Hamra",
  "Dakhla-Oued Ed-Dahab",
];

export default function ProfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    artistName: "",
    bio: "",
    phone: "",
    city: "",
    region: "",
    website: "",
    primaryProfessionId: "",
    experienceLevel: "JUNIOR",
    availabilityStatus: "AVAILABLE",
    isPublic: true,
  });

  // Related data
  const [professionCategories, setProfessionCategories] = useState<ProfessionCategory[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [allLanguages, setAllLanguages] = useState<Language[]>([]);

  // Selected skills and languages
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<
    { languageId: string; level: string }[]
  >([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [languageSearch, setLanguageSearch] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      const [profileRes, professionsRes, skillsRes, languagesRes] = await Promise.all([
        fetch("/api/profiles/me"),
        fetch("/api/professions"),
        fetch("/api/skills"),
        fetch("/api/languages"),
      ]);

      if (professionsRes.ok) {
        const data = await professionsRes.json();
        setProfessionCategories(data.categories ?? []);
      }
      if (skillsRes.ok) {
        const data = await skillsRes.json();
        setAllSkills(data.skills ?? []);
      }
      if (languagesRes.ok) {
        const data = await languagesRes.json();
        setAllLanguages(data.languages ?? []);
      }
      if (profileRes.ok) {
        const data = await profileRes.json();
        const p = data.profile;
        if (p) {
          setForm({
            firstName: p.firstName ?? "",
            lastName: p.lastName ?? "",
            artistName: p.artistName ?? "",
            bio: p.bio ?? "",
            phone: p.phone ?? "",
            city: p.city ?? "",
            region: p.region ?? "",
            website: p.website ?? "",
            primaryProfessionId: p.primaryProfessionId ?? "",
            experienceLevel: p.experienceLevel ?? "JUNIOR",
            availabilityStatus: p.availabilityStatus ?? "AVAILABLE",
            isPublic: p.isPublic ?? true,
          });
          setSelectedSkills(p.skills?.map((s: { skill: Skill }) => s.skill.id) ?? []);
          setSelectedLanguages(
            p.languages?.map((l: { language: Language; level: string }) => ({
              languageId: l.language.id,
              level: l.level,
            })) ?? []
          );
        }
      }
    } catch {
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelect = (name: string, value: string | null) => {
    setForm((prev) => ({ ...prev, [name]: value ?? "" }));
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const addLanguage = (languageId: string) => {
    if (!selectedLanguages.find((l) => l.languageId === languageId)) {
      setSelectedLanguages((prev) => [...prev, { languageId, level: "CONVERSATIONAL" }]);
    }
    setLanguageSearch("");
  };

  const removeLanguage = (languageId: string) => {
    setSelectedLanguages((prev) => prev.filter((l) => l.languageId !== languageId));
  };

  const updateLanguageLevel = (languageId: string, level: string | null) => {
    setSelectedLanguages((prev) =>
      prev.map((l) => (l.languageId === languageId ? { ...l, level: level ?? l.level } : l))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profiles/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          skills: selectedSkills,
          languages: selectedLanguages,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erreur lors de la sauvegarde");
        return;
      }

      toast.success("Profil mis à jour avec succès");
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const filteredSkills = allSkills.filter((s) =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase())
  );
  const filteredLanguages = allLanguages.filter(
    (l) =>
      l.name.toLowerCase().includes(languageSearch.toLowerCase()) &&
      !selectedLanguages.find((sl) => sl.languageId === l.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-blue-900">Mon profil</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complétez votre profil pour augmenter votre visibilité sur la plateforme.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photo de profil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <Button type="button" variant="outline" size="sm" disabled>
                  <Camera className="h-4 w-4 mr-2" />
                  Choisir une photo
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  JPG ou PNG, max 5 Mo. Fonctionnalité bientôt disponible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="artistName">Nom d&apos;artiste / Pseudonyme</Label>
              <Input
                id="artistName"
                name="artistName"
                value={form.artistName}
                onChange={handleChange}
                placeholder="Facultatif"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Biographie / Présentation</Label>
              <Textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={5}
                placeholder="Décrivez votre parcours, vos spécialités, vos projets marquants..."
                maxLength={2000}
              />
              <p className="text-xs text-gray-400 text-right">{form.bio.length}/2000</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+212 6XX XXX XXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://monsite.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Casablanca"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Région</Label>
                <Select
                  value={form.region}
                  onValueChange={(v) => handleSelect("region", v)}
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Sélectionnez une région" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOROCCAN_REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profession */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Métier principal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryProfessionId">Profession principale</Label>
              <Select
                value={form.primaryProfessionId}
                onValueChange={(v) => handleSelect("primaryProfessionId", v)}
              >
                <SelectTrigger id="primaryProfessionId">
                  <SelectValue placeholder="Sélectionnez votre métier principal" />
                </SelectTrigger>
                <SelectContent>
                  {professionCategories.map((cat) => (
                    <div key={cat.id}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {cat.name}
                      </div>
                      {cat.professions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Niveau d&apos;expérience</Label>
              <Select
                value={form.experienceLevel}
                onValueChange={(v) => handleSelect("experienceLevel", v)}
              >
                <SelectTrigger id="experienceLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compétences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {selectedSkills.length === 0 && (
                <p className="text-sm text-gray-400">Aucune compétence sélectionnée.</p>
              )}
              {selectedSkills.map((skillId) => {
                const skill = allSkills.find((s) => s.id === skillId);
                if (!skill) return null;
                return (
                  <Badge key={skillId} variant="secondary" className="gap-1">
                    {skill.name}
                    <button type="button" onClick={() => toggleSkill(skillId)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
            <Separator />
            <Input
              placeholder="Rechercher une compétence..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
            />
            {skillSearch && (
              <div className="max-h-48 overflow-y-auto rounded-lg border bg-white shadow-sm">
                {filteredSkills.slice(0, 20).map((skill) => (
                  <label
                    key={skill.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedSkills.includes(skill.id)}
                      onCheckedChange={() => toggleSkill(skill.id)}
                    />
                    <span className="text-sm">{skill.name}</span>
                  </label>
                ))}
                {filteredSkills.length === 0 && (
                  <p className="text-sm text-gray-500 px-3 py-2">Aucun résultat</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Langues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {selectedLanguages.map((sl) => {
                const lang = allLanguages.find((l) => l.id === sl.languageId);
                if (!lang) return null;
                return (
                  <div key={sl.languageId} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-32 truncate">{lang.name}</span>
                    <Select
                      value={sl.level}
                      onValueChange={(v) => updateLanguageLevel(sl.languageId, v)}
                    >
                      <SelectTrigger className="flex-1 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_LEVELS.map((ll) => (
                          <SelectItem key={ll.value} value={ll.value}>
                            {ll.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                      onClick={() => removeLanguage(sl.languageId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="relative">
              <Input
                placeholder="Ajouter une langue..."
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.target.value)}
              />
              {languageSearch && filteredLanguages.length > 0 && (
                <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto rounded-lg border bg-white shadow-lg">
                  {filteredLanguages.slice(0, 10).map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left text-sm"
                      onClick={() => addLanguage(lang.id)}
                    >
                      <Plus className="h-3 w-3 text-gray-400" />
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visibilité</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={form.isPublic}
                onCheckedChange={(v) =>
                  setForm((prev) => ({ ...prev, isPublic: v === true }))
                }
              />
              <div>
                <p className="text-sm font-medium">Profil public</p>
                <p className="text-xs text-gray-500">
                  Votre profil est visible dans l&apos;annuaire et les résultats de recherche.
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-900 hover:bg-blue-800 gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
}
