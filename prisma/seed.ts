import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ==========================================
  // PROFESSION CATEGORIES & PROFESSIONS
  // ==========================================

  const categories = await Promise.all([
    prisma.professionCategory.upsert({
      where: { slug: "interpretation" },
      update: {},
      create: {
        name: "Interprétation",
        nameAr: "التمثيل",
        slug: "interpretation",
        sortOrder: 1,
      },
    }),
    prisma.professionCategory.upsert({
      where: { slug: "realisation-production" },
      update: {},
      create: {
        name: "Réalisation & Production",
        nameAr: "الإخراج والإنتاج",
        slug: "realisation-production",
        sortOrder: 2,
      },
    }),
    prisma.professionCategory.upsert({
      where: { slug: "technique-image-son" },
      update: {},
      create: {
        name: "Technique Image & Son",
        nameAr: "تقنية الصورة والصوت",
        slug: "technique-image-son",
        sortOrder: 3,
      },
    }),
    prisma.professionCategory.upsert({
      where: { slug: "post-production" },
      update: {},
      create: {
        name: "Post-production",
        nameAr: "ما بعد الإنتاج",
        slug: "post-production",
        sortOrder: 4,
      },
    }),
    prisma.professionCategory.upsert({
      where: { slug: "ecriture-scenographie" },
      update: {},
      create: {
        name: "Écriture & Scénographie",
        nameAr: "الكتابة والسينوغرافيا",
        slug: "ecriture-scenographie",
        sortOrder: 5,
      },
    }),
    prisma.professionCategory.upsert({
      where: { slug: "decoration-costume-maquillage" },
      update: {},
      create: {
        name: "Décoration, Costume & Maquillage",
        nameAr: "الديكور والأزياء والمكياج",
        slug: "decoration-costume-maquillage",
        sortOrder: 6,
      },
    }),
    prisma.professionCategory.upsert({
      where: { slug: "animation-vfx" },
      update: {},
      create: {
        name: "Animation & VFX",
        nameAr: "الرسوم المتحركة والمؤثرات البصرية",
        slug: "animation-vfx",
        sortOrder: 7,
      },
    }),
    prisma.professionCategory.upsert({
      where: { slug: "regie-coordination" },
      update: {},
      create: {
        name: "Régie & Coordination",
        nameAr: "الإدارة والتنسيق",
        slug: "regie-coordination",
        sortOrder: 8,
      },
    }),
  ]);

  const [
    interpretation,
    realisationProduction,
    techniqueImageSon,
    postProduction,
    ecritureScenographie,
    decorationCostumeMaquillage,
    animationVfx,
    regieCoordination,
  ] = categories;

  // Professions
  const professions = [
    // Interprétation
    { name: "Acteur / Comédien", nameAr: "ممثل", slug: "acteur-comedien", categoryId: interpretation.id, sortOrder: 1 },
    // Réalisation & Production
    { name: "Réalisateur", nameAr: "مخرج", slug: "realisateur", categoryId: realisationProduction.id, sortOrder: 1 },
    { name: "Producteur", nameAr: "منتج", slug: "producteur", categoryId: realisationProduction.id, sortOrder: 2 },
    { name: "Assistant réalisateur", nameAr: "مساعد مخرج", slug: "assistant-realisateur", categoryId: realisationProduction.id, sortOrder: 3 },
    { name: "Directeur de casting", nameAr: "مدير اختيار الممثلين", slug: "directeur-casting", categoryId: realisationProduction.id, sortOrder: 4 },
    // Technique Image & Son
    { name: "Opérateur image", nameAr: "مصور", slug: "operateur-image", categoryId: techniqueImageSon.id, sortOrder: 1 },
    { name: "Opérateur son", nameAr: "تقني صوت", slug: "operateur-son", categoryId: techniqueImageSon.id, sortOrder: 2 },
    { name: "Ingénieur lumière", nameAr: "مهندس إضاءة", slug: "ingenieur-lumiere", categoryId: techniqueImageSon.id, sortOrder: 3 },
    { name: "Photographe de plateau", nameAr: "مصور البلاتو", slug: "photographe-plateau", categoryId: techniqueImageSon.id, sortOrder: 4 },
    // Post-production
    { name: "Monteur", nameAr: "مونتير", slug: "monteur", categoryId: postProduction.id, sortOrder: 1 },
    { name: "Étalonneur", nameAr: "ملون", slug: "etalonneur", categoryId: postProduction.id, sortOrder: 2 },
    { name: "Compositeur", nameAr: "ملحن", slug: "compositeur", categoryId: postProduction.id, sortOrder: 3 },
    // Écriture & Scénographie
    { name: "Scénariste", nameAr: "كاتب سيناريو", slug: "scenariste", categoryId: ecritureScenographie.id, sortOrder: 1 },
    { name: "Scénographe", nameAr: "سينوغراف", slug: "scenographe", categoryId: ecritureScenographie.id, sortOrder: 2 },
    // Décoration, Costume & Maquillage
    { name: "Décorateur", nameAr: "مصمم ديكور", slug: "decorateur", categoryId: decorationCostumeMaquillage.id, sortOrder: 1 },
    { name: "Costumier", nameAr: "مصمم أزياء", slug: "costumier", categoryId: decorationCostumeMaquillage.id, sortOrder: 2 },
    { name: "Maquilleur", nameAr: "فنان مكياج", slug: "maquilleur", categoryId: decorationCostumeMaquillage.id, sortOrder: 3 },
    // Animation & VFX
    { name: "Animateur", nameAr: "رسام متحرك", slug: "animateur", categoryId: animationVfx.id, sortOrder: 1 },
    { name: "Technicien VFX", nameAr: "تقني مؤثرات بصرية", slug: "technicien-vfx", categoryId: animationVfx.id, sortOrder: 2 },
    // Régie & Coordination
    { name: "Régisseur", nameAr: "مدير إنتاج", slug: "regisseur", categoryId: regieCoordination.id, sortOrder: 1 },
  ];

  for (const prof of professions) {
    await prisma.profession.upsert({
      where: { slug: prof.slug },
      update: {},
      create: prof,
    });
  }

  // ==========================================
  // SKILL CATEGORIES & SKILLS
  // ==========================================

  const skillCategories = await Promise.all([
    prisma.skillCategory.upsert({
      where: { name: "Jeu & Interprétation" },
      update: {},
      create: { name: "Jeu & Interprétation" },
    }),
    prisma.skillCategory.upsert({
      where: { name: "Technique" },
      update: {},
      create: { name: "Technique" },
    }),
    prisma.skillCategory.upsert({
      where: { name: "Logiciels" },
      update: {},
      create: { name: "Logiciels" },
    }),
    prisma.skillCategory.upsert({
      where: { name: "Physique & Cascades" },
      update: {},
      create: { name: "Physique & Cascades" },
    }),
    prisma.skillCategory.upsert({
      where: { name: "Musique & Voix" },
      update: {},
      create: { name: "Musique & Voix" },
    }),
  ]);

  const [jeuInterpretation, technique, logiciels, physiqueCascades, musiqueVoix] = skillCategories;

  const skills = [
    // Jeu & Interprétation
    { name: "Improvisation", categoryId: jeuInterpretation.id },
    { name: "Comédie", categoryId: jeuInterpretation.id },
    { name: "Drame", categoryId: jeuInterpretation.id },
    { name: "Théâtre classique", categoryId: jeuInterpretation.id },
    { name: "Doublage voix", categoryId: jeuInterpretation.id },
    { name: "Mime", categoryId: jeuInterpretation.id },
    { name: "Marionnettes", categoryId: jeuInterpretation.id },
    // Technique
    { name: "Cadrage", categoryId: technique.id },
    { name: "Éclairage", categoryId: technique.id },
    { name: "Prise de son", categoryId: technique.id },
    { name: "Mixage audio", categoryId: technique.id },
    { name: "Steadicam", categoryId: technique.id },
    { name: "Drone", categoryId: technique.id },
    { name: "Étalonnage", categoryId: technique.id },
    // Logiciels
    { name: "DaVinci Resolve", categoryId: logiciels.id },
    { name: "Adobe Premiere Pro", categoryId: logiciels.id },
    { name: "Final Cut Pro", categoryId: logiciels.id },
    { name: "After Effects", categoryId: logiciels.id },
    { name: "Pro Tools", categoryId: logiciels.id },
    { name: "Maya", categoryId: logiciels.id },
    { name: "Blender", categoryId: logiciels.id },
    { name: "Nuke", categoryId: logiciels.id },
    // Physique & Cascades
    { name: "Cascades", categoryId: physiqueCascades.id },
    { name: "Combat scénique", categoryId: physiqueCascades.id },
    { name: "Danse", categoryId: physiqueCascades.id },
    { name: "Équitation", categoryId: physiqueCascades.id },
    // Musique & Voix
    { name: "Chant", categoryId: musiqueVoix.id },
    { name: "Composition musicale", categoryId: musiqueVoix.id },
    { name: "Instruments à cordes", categoryId: musiqueVoix.id },
    { name: "Percussions", categoryId: musiqueVoix.id },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }

  // ==========================================
  // LANGUAGES
  // ==========================================

  const languages = [
    { name: "Arabe", code: "ar" },
    { name: "Arabe dialectal (Darija)", code: "ary" },
    { name: "Français", code: "fr" },
    { name: "Anglais", code: "en" },
    { name: "Amazigh", code: "ber" },
    { name: "Espagnol", code: "es" },
    { name: "Allemand", code: "de" },
    { name: "Italien", code: "it" },
    { name: "Turc", code: "tr" },
    { name: "Hindi", code: "hi" },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    });
  }

  // ==========================================
  // INSTITUTIONS
  // ==========================================

  const institutions = [
    {
      name: "ISADAC - Institut Supérieur d'Art Dramatique et d'Animation Culturelle",
      type: "SCHOOL" as const,
      city: "Rabat",
      website: "https://isadac.ma",
    },
    {
      name: "ISMAC - Institut Supérieur des Métiers de l'Audiovisuel et du Cinéma",
      type: "SCHOOL" as const,
      city: "Rabat",
      website: "https://ismac.ma",
    },
    {
      name: "ESAV Marrakech - École Supérieure des Arts Visuels",
      type: "SCHOOL" as const,
      city: "Marrakech",
      website: "https://esav-marrakech.com",
    },
    {
      name: "CCM - Centre Cinématographique Marocain",
      type: "ORGANIZATION" as const,
      city: "Rabat",
      website: "https://ccm.ma",
    },
    {
      name: "SNRT - Société Nationale de Radiodiffusion et de Télévision",
      type: "ORGANIZATION" as const,
      city: "Rabat",
      website: "https://snrt.ma",
    },
    {
      name: "2M - Soread 2M",
      type: "ORGANIZATION" as const,
      city: "Casablanca",
      website: "https://2m.ma",
    },
  ];

  for (const inst of institutions) {
    await prisma.institution.upsert({
      where: { name: inst.name },
      update: {},
      create: inst,
    });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
