import { prisma } from "@/lib/prisma";
import { requireAdminOrModerator } from "@/lib/auth";
import { Wrench, Tag, Hash } from "@phosphor-icons/react/dist/ssr";
import { AddSkillDialog, DeleteSkillButton } from "./actions";

export const metadata = { title: "Compétences — Administration" };
export const dynamic = "force-dynamic";

export default async function CompetencesPage() {
  await requireAdminOrModerator();

  const categories = await prisma.skillCategory.findMany({
    include: {
      skills: {
        include: {
          _count: { select: { profiles: true } },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Skills without category
  const uncategorized = await prisma.skill.findMany({
    where: { categoryId: null },
    include: { _count: { select: { profiles: true } } },
    orderBy: { name: "asc" },
  });

  const totalSkills = categories.reduce(
    (acc, cat) => acc + cat.skills.length,
    uncategorized.length
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950 flex items-center gap-2">
            <Wrench weight="duotone" className="h-6 w-6 text-amber-500" />
            Compétences
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {totalSkills} compétence{totalSkills !== 1 ? "s" : ""} répertoriées
            dans {categories.length} catégorie{categories.length !== 1 ? "s" : ""}
          </p>
        </div>
        <AddSkillDialog
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>

      {/* Categories with skills */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            {/* Category header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#fafaf9] border-b border-zinc-200">
              <Tag weight="duotone" className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-zinc-950">
                {category.name}
              </span>
              <span className="ml-auto text-xs text-zinc-400 font-mono">
                {category.skills.length}
              </span>
            </div>

            {/* Skills list */}
            {category.skills.length === 0 ? (
              <p className="px-4 py-4 text-sm text-zinc-400">
                Aucune compétence dans cette catégorie.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-200">
                {category.skills.map((skill) => (
                  <li
                    key={skill.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#fafaf9] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-zinc-950">{skill.name}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-mono">
                        <Hash weight="regular" className="h-3 w-3" />
                        {skill._count.profiles}
                      </span>
                    </div>
                    <DeleteSkillButton
                      skill={{
                        id: skill.id,
                        name: skill.name,
                        categoryId: skill.categoryId,
                        _count: { profiles: skill._count.profiles },
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {/* Uncategorized */}
        {uncategorized.length > 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#fafaf9] border-b border-zinc-200">
              <Tag weight="regular" className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-semibold text-zinc-500">
                Sans catégorie
              </span>
              <span className="ml-auto text-xs text-zinc-400 font-mono">
                {uncategorized.length}
              </span>
            </div>
            <ul className="divide-y divide-zinc-200">
              {uncategorized.map((skill) => (
                <li
                  key={skill.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#fafaf9] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-950">{skill.name}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-mono">
                      <Hash weight="regular" className="h-3 w-3" />
                      {skill._count.profiles}
                    </span>
                  </div>
                  <DeleteSkillButton
                    skill={{
                      id: skill.id,
                      name: skill.name,
                      categoryId: skill.categoryId,
                      _count: { profiles: skill._count.profiles },
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {categories.length === 0 && uncategorized.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center py-20 gap-3">
            <Wrench weight="duotone" className="h-12 w-12 text-zinc-300" />
            <p className="text-zinc-500 text-sm">Aucune compétence configurée</p>
          </div>
        )}
      </div>
    </div>
  );
}
