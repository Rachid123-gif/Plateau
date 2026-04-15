import { PrismaClient } from "@prisma/client";

// ArticleStatus values — defined here to avoid dependency on Prisma-generated types
// that won't exist until after `prisma generate`
const ArticleStatus = { PUBLISHED: "PUBLISHED", DRAFT: "DRAFT" } as const;

const prisma = new PrismaClient();
// Use any-typed proxy for blog models (not yet generated)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

async function main() {
  // Find first ADMIN user
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!adminUser) {
    console.error("No ADMIN user found. Create one first.");
    process.exit(1);
  }

  console.log(`Using author: ${adminUser.email}`);

  // Upsert categories
  const portraits = await db.blogCategory.upsert({
    where: { slug: "portraits" },
    update: {},
    create: {
      name: "Portraits",
      slug: "portraits",
      description: "Rencontres avec les artisans du cinéma marocain",
      color: "#f59e0b",
      sortOrder: 1,
    },
  });

  const guides = await db.blogCategory.upsert({
    where: { slug: "guides-metiers" },
    update: {},
    create: {
      name: "Guides métiers",
      slug: "guides-metiers",
      description: "Conseils pratiques pour les professionnels du secteur",
      color: "#10b981",
      sortOrder: 2,
    },
  });

  const actu = await db.blogCategory.upsert({
    where: { slug: "actualites" },
    update: {},
    create: {
      name: "Actualités",
      slug: "actualites",
      description: "Les dernières nouvelles du cinéma marocain",
      color: "#3b82f6",
      sortOrder: 3,
    },
  });

  const tournages = await db.blogCategory.upsert({
    where: { slug: "tournages" },
    update: {},
    create: {
      name: "Tournages",
      slug: "tournages",
      description: "Dans les coulisses des productions en cours",
      color: "#8b5cf6",
      sortOrder: 4,
    },
  });

  console.log("Categories seeded.");

  // Upsert articles
  const articles = [
    {
      slug: "youssef-ait-mansour-directeur-photo",
      title: "Youssef Aït Mansour : « La lumière marocaine est une dramaturgie à elle seule »",
      excerpt:
        "Rencontre avec le directeur de la photographie qui a signé trois des films les plus remarqués de la saison au Festival International du Film de Marrakech.",
      content: `<p>La première fois que Youssef Aït Mansour a tenu une caméra, il avait onze ans. Un Super 8 appartenant à son père, ingénieur chez l'OCP. Ce souvenir, il le raconte avec une précision de technicien et une émotion d'artiste.</p>

<h2>De Tiznit à Ouarzazate</h2>
<p>Né à Tiznit dans une famille berbère attachée aux traditions orales, Youssef a grandi entre les récits de sa grand-mère et les westerns diffusés le vendredi soir sur la RTM. « Ces deux univers m'ont tout appris sur le rythme et la tension dramatique. »</p>
<p>Après des études à l'ISADAC de Rabat, il rejoint les équipes de tournage d'Atlas Corporation Studios à Ouarzazate — ce Hollywood du désert où le ciel, l'ocre et la roche créent des décors que l'on ne fabrique pas, on les révèle.</p>

<h2>Une signature lumineuse</h2>
<p>Sa marque de fabrique : une lumière rasante, mordorée, qui transforme les visages en paysages. « Au Maroc, la lumière change toutes les vingt minutes. C'est une contrainte mais c'est surtout un cadeau. Les Parisiens qui viennent tourner ici sont toujours stupéfaits. »</p>

<blockquote>La lumière marocaine est une dramaturgie à elle seule. Elle crée de la profondeur sans qu'on lui demande rien.</blockquote>

<p>Ses récents travaux sur <em>Les Fils du vent</em>, le long-métrage de Leila Marrakchi présenté à la Quinzaine des réalisateurs, ont confirmé sa place parmi les directeurs photo les plus recherchés de la région MENA.</p>

<h2>Conseil aux jeunes talents</h2>
<p>Pour les jeunes opérateurs image qui veulent percer, son conseil est sans détour : « Maîtrisez la lumière naturelle avant les LED. Comprenez comment le soleil bouge dans l'espace et dans le temps. C'est la base de tout. »</p>`,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      categoryId: portraits.id,
      readingTime: 6,
      tags: ["directeur photo", "portrait", "FIFM", "Ouarzazate"],
    },
    {
      slug: "construire-portfolio-metier-du-cinema",
      title: "Comment construire un portfolio convaincant dans les métiers du cinéma",
      excerpt:
        "Du dossier de presse papier au profil numérique : guide pratique pour valoriser votre parcours et décrocher vos prochains projets.",
      content: `<p>Dans l'industrie audiovisuelle marocaine en plein essor, la qualité de votre portfolio peut faire la différence entre décrocher un contrat sur une co-production internationale et rester sur le banc de touche.</p>

<h2>Définir son positionnement avant tout</h2>
<p>Avant de compiler vos réalisations, posez-vous une question fondamentale : pour quel type de projets voulez-vous être contacté ? Un monteur qui cible les publicités institutionnelles n'aura pas le même portfolio qu'un monteur spécialisé en documentaire ethnographique.</p>

<h2>Les trois piliers d'un portfolio solide</h2>
<ul>
  <li><strong>Une sélection courageuse :</strong> mieux vaut cinq projets exceptionnels que quinze projets médiocres.</li>
  <li><strong>Des références vérifiables :</strong> mentionnez le titre du film, le réalisateur, l'année, votre rôle précis.</li>
  <li><strong>Un extrait ou une démo récente :</strong> pour les métiers techniques, une séquence de deux à trois minutes vaut mieux qu'un long discours.</li>
</ul>

<blockquote>Un bon portfolio ne montre pas tout ce que vous savez faire — il montre ce que vous voulez faire.</blockquote>

<h2>Mettre à jour régulièrement</h2>
<p>Un portfolio figé donne l'impression d'une carrière figée. Visez une mise à jour après chaque projet significatif.</p>`,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      categoryId: guides.id,
      readingTime: 8,
      tags: ["portfolio", "carrière", "conseils", "profil"],
    },
    {
      slug: "festival-cinema-africain-tanger-2026",
      title: "Festival du Cinéma Africain de Tanger : les films à ne pas manquer",
      excerpt:
        "La sélection officielle de la 14e édition révèle une nouvelle génération de cinéastes africains qui dialoguent avec leur histoire et leur présent.",
      content: `<p>Tanger, ville de passages et de confluences, accueille cette année une édition particulièrement dense du Festival du Cinéma Africain. Cinquante-deux films en compétition, dix-sept pays représentés.</p>

<h2>La compétition officielle</h2>
<p>Six longs-métrages se disputent le Grand Atlas. Parmi eux, le film marocain <em>Azul N'Smayen</em> de Sofia Alaoui fait figure de favori.</p>

<h2>La section Panorama</h2>
<p>C'est souvent dans les sections parallèles que se nichent les vraies découvertes. Cette année, la section Panorama présente une rétrospective du cinéma amazigh.</p>

<blockquote>Le cinéma africain n'a plus besoin de se définir en opposition au cinéma occidental. Il a ses propres langages, ses propres urgences.</blockquote>

<h2>Masterclasses et rencontres professionnelles</h2>
<p>En marge de la compétition, les professionnels pourront assister à des masterclasses animées par Daoud Aoulad Syad, Farida Benlyazid et la monteuse franco-marocaine Nadia Rais.</p>`,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      categoryId: actu.id,
      readingTime: 5,
      tags: ["festival", "Tanger", "cinéma africain", "sélection"],
    },
    {
      slug: "tournage-desert-erg-chebbi-production-internationale",
      title: "Dans les dunes : sur le tournage d'une coproduction franco-marocaine à Erg Chebbi",
      excerpt:
        "Trois semaines avec l'équipe du film « Insomnies de sable » de Jules Laroche, une immersion dans les défis logistiques et humains d'un tournage en milieu extrême.",
      content: `<p>Cinq heures du matin, le soleil est encore absent mais la lumière commence à teinter l'horizon de rose et d'ocre. Sur le site de tournage, à douze kilomètres de Merzouga, l'équipe est déjà en place.</p>

<h2>La logistique du désert</h2>
<p>Tourner dans l'Erg Chebbi, c'est d'abord un défi logistique hors normes. Le sable pénètre partout. Les caméras Arri Alexa 35 sont protégées par des housses spéciales. La chaleur en journée dépasse les 45 degrés.</p>

<h2>Le casting local</h2>
<p>Dix des vingt-deux rôles du film sont tenus par des acteurs marocains, dont plusieurs sans formation académique mais avec une présence cinématographique remarquable.</p>

<blockquote>Le désert n'est pas un décor. C'est un personnage à part entière, et il faut le traiter avec le même respect qu'un acteur principal.</blockquote>

<h2>Un modèle de coproduction exemplaire</h2>
<p>Ce tournage illustre ce que peut être une coproduction équitable : une équipe mixte, des techniciens marocains aux postes clés, et un budget partagé qui bénéficie réellement à l'économie locale.</p>`,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      categoryId: tournages.id,
      readingTime: 7,
      tags: ["tournage", "désert", "coproduction", "Merzouga"],
    },
  ];

  for (const article of articles) {
    await db.blogArticle.upsert({
      where: { slug: article.slug },
      update: { ...article },
      create: { ...article, authorId: adminUser.id },
    });
    console.log(`  Seeded: ${article.slug}`);
  }

  console.log("Blog seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
