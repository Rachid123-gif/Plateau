"use client";

import { useState, useEffect, useRef } from "react";
import {
  ImageSquare,
  Video,
  MusicNote,
  File,
  Link as LinkIcon,
  Plus,
  Trash,
  ArrowUp,
  ArrowDown,
  X,
  UploadSimple,
  ArrowSquareOut,
} from "@phosphor-icons/react";

type MediaType = "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "LINK";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  type: MediaType;
  url: string;
  thumbnailUrl: string | null;
  year: number | null;
  sortOrder: number;
  createdAt: string;
}

const TYPE_OPTIONS: { value: MediaType; label: string }[] = [
  { value: "IMAGE", label: "Image" },
  { value: "VIDEO", label: "Vidéo" },
  { value: "AUDIO", label: "Audio" },
  { value: "DOCUMENT", label: "Document" },
  { value: "LINK", label: "Lien externe" },
];

const TYPE_ICON: Record<MediaType, React.ReactNode> = {
  IMAGE: <ImageSquare weight="duotone" className="h-5 w-5 text-amber-500" />,
  VIDEO: <Video weight="duotone" className="h-5 w-5 text-blue-500" />,
  AUDIO: <MusicNote weight="duotone" className="h-5 w-5 text-purple-500" />,
  DOCUMENT: <File weight="duotone" className="h-5 w-5 text-zinc-500" />,
  LINK: <LinkIcon weight="duotone" className="h-5 w-5 text-emerald-500" />,
};

const TYPE_LABEL: Record<MediaType, string> = {
  IMAGE: "Image",
  VIDEO: "Vidéo",
  AUDIO: "Audio",
  DOCUMENT: "Document",
  LINK: "Lien",
};

const ACCEPT_BY_TYPE: Record<MediaType, string> = {
  IMAGE: "image/*",
  VIDEO: "video/*",
  AUDIO: "audio/*",
  DOCUMENT: ".pdf,.doc,.docx,.ppt,.pptx",
  LINK: "",
};

function ItemPreview({ item }: { item: PortfolioItem }) {
  if (item.type === "IMAGE") {
    return (
      <div className="h-24 w-24 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0">
        <img
          src={item.url}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    );
  }
  if (item.type === "VIDEO") {
    return (
      <div className="h-24 w-24 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900 shrink-0 flex items-center justify-center">
        <Video weight="duotone" className="h-8 w-8 text-zinc-400" />
      </div>
    );
  }
  return (
    <div className="h-24 w-24 rounded-xl border border-zinc-200 bg-zinc-50 shrink-0 flex items-center justify-center">
      {TYPE_ICON[item.type]}
    </div>
  );
}

interface AddItemFormProps {
  onClose: () => void;
  onAdded: (item: PortfolioItem) => void;
}

function AddItemForm({ onClose, onAdded }: AddItemFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<MediaType>("IMAGE");
  const [url, setUrl] = useState("");
  const [year, setYear] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erreur upload");
        return;
      }
      setUrl(data.url);
    } catch {
      setError("Erreur réseau lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          type,
          url,
          year: year ? parseInt(year) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la création");
        return;
      }

      onAdded(data.item);
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-950">
            Ajouter un élément de portfolio
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
          >
            <X weight="regular" className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Titre du projet"
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setType(opt.value);
                    setUrl("");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                    type === opt.value
                      ? "bg-zinc-950 text-white border-zinc-950"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* URL ou upload */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              {type === "LINK" ? "URL" : "Fichier ou URL"}{" "}
              <span className="text-red-500">*</span>
            </label>
            {type !== "LINK" && (
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  <UploadSimple weight="regular" className="h-4 w-4" />
                  {uploading ? "Upload en cours..." : "Choisir un fichier"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT_BY_TYPE[type]}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
            {url && type === "IMAGE" && (
              <div className="mt-2 h-20 w-20 rounded-xl border border-zinc-200 overflow-hidden bg-zinc-100">
                <img
                  src={url}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Description du projet..."
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Année
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder={String(new Date().getFullYear())}
              min={1900}
              max={new Date().getFullYear() + 1}
              className="w-32 px-3 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-zinc-300 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim() || !url.trim()}
              className="flex-1 px-4 py-2 rounded-xl bg-zinc-950 text-white text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Ajout en cours..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet élément ?")) return;
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[index],
    ];

    // Update sortOrder on server for both items
    const a = newItems[index];
    const b = newItems[targetIndex];
    await Promise.all([
      fetch(`/api/portfolio/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: index }),
      }),
      fetch(`/api/portfolio/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: targetIndex }),
      }),
    ]);

    setItems(newItems);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950 flex items-center gap-2">
            <ImageSquare weight="duotone" className="h-6 w-6 text-amber-500" />
            Portfolio
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Gérez vos réalisations et projets
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 text-white text-sm font-medium hover:bg-zinc-800 transition-colors hover:-translate-y-[1px]"
        >
          <Plus weight="regular" className="h-4 w-4" />
          Ajouter un élément
        </button>
      </div>

      {/* Portfolio items */}
      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 flex items-center justify-center">
          <p className="text-zinc-400 text-sm">Chargement...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center py-20 gap-4">
          <ImageSquare weight="duotone" className="h-14 w-14 text-zinc-200" />
          <div className="text-center">
            <p className="text-zinc-950 font-medium">Aucun élément de portfolio</p>
            <p className="text-zinc-500 text-sm mt-1">
              Ajoutez vos réalisations pour les mettre en valeur
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            <Plus weight="regular" className="h-4 w-4" />
            Ajouter mon premier élément
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
          <ul className="divide-y divide-zinc-200">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center gap-4 px-4 py-4 hover:bg-[#fafaf9] transition-colors"
              >
                {/* Preview */}
                <ItemPreview item={item} />

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-950 truncate">
                      {item.title}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs shrink-0">
                      {TYPE_ICON[item.type]}
                      {TYPE_LABEL[item.type]}
                    </span>
                    {item.year && (
                      <span className="text-xs text-zinc-400 shrink-0 font-mono">
                        {item.year}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-zinc-500 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <ArrowSquareOut weight="regular" className="h-3.5 w-3.5" />
                    Voir le lien
                  </a>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-20"
                    title="Monter"
                  >
                    <ArrowUp weight="regular" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleMove(index, "down")}
                    disabled={index === items.length - 1}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-20"
                    title="Descendre"
                  >
                    <ArrowDown weight="regular" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <Trash weight="regular" className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showForm && (
        <AddItemForm
          onClose={() => setShowForm(false)}
          onAdded={(item) => {
            setItems((prev) => [...prev, item]);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
