"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, CheckCircle2, Filter, X } from "lucide-react";
import Link from "next/link";
import { MOROCCAN_CITIES, EXPERIENCE_LEVEL_LABELS, AVAILABILITY_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface Profession {
  id: string;
  name: string;
  slug: string;
  category: { name: string };
}

interface ProfileResult {
  id: string;
  firstName: string;
  lastName: string;
  artistName: string | null;
  slug: string;
  photoUrl: string | null;
  city: string | null;
  availabilityStatus: string;
  verificationStatus: string;
  experienceLevel: string;
  primaryProfession: { name: string } | null;
  skills: { skill: { id: string; name: string } }[];
  languages: { language: { id: string; name: string; code: string } }[];
}

interface SearchResults {
  profiles: ProfileResult[];
  total: number;
  page: number;
  totalPages: number;
}

export default function RecruteurRecherchePage() {
  const [query, setQuery] = useState("");
  const [profession, setProfession] = useState("");
  const [city, setCity] = useState("");
  const [availability, setAvailability] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetch("/api/professions")
      .then((r) => r.json())
      .then((data) => {
        const allProfs: Profession[] = [];
        for (const cat of data.categories || []) {
          for (const p of cat.professions || []) {
            allProfs.push({ ...p, category: { name: cat.name } });
          }
        }
        setProfessions(allProfs);
      });
  }, []);

  const search = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (profession) params.set("profession", profession);
    if (city) params.set("city", city);
    if (availability) params.set("availabilityStatus", availability);
    if (experienceLevel) params.set("experienceLevel", experienceLevel);
    params.set("page", String(pageNum));
    params.set("limit", "20");

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data);
      setPage(pageNum);
    } finally {
      setLoading(false);
    }
  }, [query, profession, city, availability, experienceLevel]);

  useEffect(() => {
    search(1);
  }, [search]);

  const clearFilters = () => {
    setQuery("");
    setProfession("");
    setCity("");
    setAvailability("");
    setExperienceLevel("");
  };

  const hasFilters = query || profession || city || availability || experienceLevel;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recherche avancee</h1>
        <p className="text-gray-500 mt-1">
          Trouvez les meilleurs professionnels pour vos projets
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, competence, mot-cle..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === "Enter" && search(1)}
          />
        </div>
        <Button onClick={() => search(1)} className="bg-blue-900 hover:bg-blue-800">
          Rechercher
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={profession} onValueChange={(v) => setProfession(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Metier" />
                </SelectTrigger>
                <SelectContent>
                  {professions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={city} onValueChange={(v) => setCity(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  {MOROCCAN_CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={availability} onValueChange={(v) => setAvailability(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Disponibilite" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AVAILABILITY_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={experienceLevel} onValueChange={(v) => setExperienceLevel(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-500">Filtres actifs:</span>
                {query && (
                  <Badge variant="secondary">
                    &quot;{query}&quot;
                    <button onClick={() => setQuery("")} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Effacer tout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div>
        {results && (
          <p className="text-sm text-gray-500 mb-4">
            {results.total} profil{results.total > 1 ? "s" : ""} trouve{results.total > 1 ? "s" : ""}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6 h-48" />
              </Card>
            ))}
          </div>
        ) : results?.profiles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Aucun profil ne correspond a vos criteres</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results?.profiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.photoUrl ?? undefined} />
                      <AvatarFallback className="bg-blue-100 text-blue-900">
                        {profile.firstName[0]}{profile.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {profile.firstName} {profile.lastName}
                        </h3>
                        {profile.verificationStatus === "VERIFIED" && (
                          <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      {profile.primaryProfession && (
                        <p className="text-sm text-gray-500">{profile.primaryProfession.name}</p>
                      )}
                      {profile.city && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {profile.city}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        profile.availabilityStatus === "AVAILABLE"
                          ? "default"
                          : profile.availabilityStatus === "BUSY"
                          ? "secondary"
                          : "outline"
                      }
                      className={cn(
                        "text-xs flex-shrink-0",
                        profile.availabilityStatus === "AVAILABLE" && "bg-green-100 text-green-800"
                      )}
                    >
                      {AVAILABILITY_STATUS_LABELS[profile.availabilityStatus] ?? profile.availabilityStatus}
                    </Badge>
                  </div>

                  {profile.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {profile.skills.slice(0, 3).map((s) => (
                        <Badge key={s.skill.id} variant="outline" className="text-xs">
                          {s.skill.name}
                        </Badge>
                      ))}
                      {profile.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <Link
                      href={`/profil/${profile.slug}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full"
                      )}
                    >
                      Voir le profil
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {results && results.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => search(page - 1)}
            >
              Precedent
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-500">
              Page {page} sur {results.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= results.totalPages}
              onClick={() => search(page + 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
