-- ============================================================
-- Le Journal — Blog migration for Plateau (CCM Maroc)
-- Execute via Supabase MCP or SQL editor
-- ============================================================

-- Enum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- Blog categories
CREATE TABLE blog_categories (
  id          TEXT NOT NULL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  color       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog articles
CREATE TABLE blog_articles (
  id              TEXT NOT NULL PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  excerpt         TEXT,
  content         TEXT NOT NULL,
  cover_url       TEXT,
  status          "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
  published_at    TIMESTAMPTZ,
  author_id       TEXT NOT NULL REFERENCES users(id),
  category_id     TEXT REFERENCES blog_categories(id),
  reading_time    INTEGER,
  view_count      INTEGER NOT NULL DEFAULT 0,
  seo_title       TEXT,
  seo_description TEXT,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_blog_articles_status_published ON blog_articles(status, published_at);
CREATE INDEX idx_blog_articles_slug ON blog_articles(slug);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_articles_updated_at
  BEFORE UPDATE ON blog_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED: Categories
-- ============================================================
INSERT INTO blog_categories (id, name, slug, description, color, sort_order) VALUES
  (gen_random_uuid()::text, 'Portraits', 'portraits', 'Rencontres avec les artisans du cinéma marocain', '#f59e0b', 1),
  (gen_random_uuid()::text, 'Guides métiers', 'guides-metiers', 'Conseils pratiques pour les professionnels du secteur', '#10b981', 2),
  (gen_random_uuid()::text, 'Actualités', 'actualites', 'Les dernières nouvelles du cinéma marocain', '#3b82f6', 3),
  (gen_random_uuid()::text, 'Tournages', 'tournages', 'Dans les coulisses des productions en cours', '#8b5cf6', 4);

-- ============================================================
-- SEED: Articles (uses first ADMIN user — replace ADMIN_USER_ID)
-- ============================================================
-- Step 1: capture first admin user id
DO $$
DECLARE
  v_author_id TEXT;
  v_cat_portraits TEXT;
  v_cat_guides TEXT;
  v_cat_actu TEXT;
  v_cat_tournages TEXT;
BEGIN
  SELECT id INTO v_author_id FROM users WHERE role = 'ADMIN' LIMIT 1;
  IF v_author_id IS NULL THEN
    RAISE NOTICE 'No ADMIN user found — skipping article seed.';
    RETURN;
  END IF;

  SELECT id INTO v_cat_portraits FROM blog_categories WHERE slug = 'portraits';
  SELECT id INTO v_cat_guides FROM blog_categories WHERE slug = 'guides-metiers';
  SELECT id INTO v_cat_actu FROM blog_categories WHERE slug = 'actualites';
  SELECT id INTO v_cat_tournages FROM blog_categories WHERE slug = 'tournages';

  INSERT INTO blog_articles (id, slug, title, excerpt, content, status, published_at, author_id, category_id, reading_time, tags) VALUES
  (
    gen_random_uuid()::text,
    'youssef-ait-mansour-directeur-photo',
    'Youssef Aït Mansour : « La lumière marocaine est une dramaturgie à elle seule »',
    'Rencontre avec le directeur de la photographie qui a signé trois des films les plus remarqués de la saison au Festival International du Film de Marrakech.',
    '<p>La première fois que Youssef Aït Mansour a tenu une caméra, il avait onze ans. Un Super 8 appartenant à son père, ingénieur chez l''OCP. Ce souvenir, il le raconte avec une précision de technicien et une émotion d''artiste.</p>

<h2>De Tiznit à Ouarzazate</h2>
<p>Né à Tiznit dans une famille berbère attachée aux traditions orales, Youssef a grandi entre les récits de sa grand-mère et les westerns diffusés le vendredi soir sur la RTM. « Ces deux univers m''ont tout appris sur le rythme et la tension dramatique. »</p>
<p>Après des études à l''ISADAC de Rabat, il rejoint les équipes de tournage d''Atlas Corporation Studios à Ouarzazate — ce Hollywood du désert où le ciel, l''ocre et la roche créent des décors que l''on ne fabrique pas, on les révèle.</p>

<h2>Une signature lumineuse</h2>
<p>Sa marque de fabrique : une lumière rasante, mordorée, qui transforme les visages en paysages. « Au Maroc, la lumière change toutes les vingt minutes. C''est une contrainte mais c''est surtout un cadeau. Les Parisiens qui viennent tourner ici sont toujours stupéfaits. »</p>

<blockquote>La lumière marocaine est une dramaturgie à elle seule. Elle crée de la profondeur sans qu''on lui demande rien.</blockquote>

<p>Ses récents travaux sur <em>Les Fils du vent</em>, le long-métrage de Leila Marrakchi présenté à la Quinzaine des réalisateurs, ont confirmé sa place parmi les directeurs photo les plus recherchés de la région MENA.</p>

<h2>Conseil aux jeunes talents</h2>
<p>Pour les jeunes opérateurs image qui veulent percer, son conseil est sans détour : « Maîtrisez la lumière naturelle avant les LED. Comprenez comment le soleil bouge dans l''espace et dans le temps. C''est la base de tout. » Il recommande également une formation rigoureuse à la colorimétrie : « Un film se construit aussi en post, mais si vous ne savez pas ce que vous capturez à la prise de vues, vous êtes perdu. »</p>',
    'PUBLISHED',
    NOW() - INTERVAL '5 days',
    v_author_id,
    v_cat_portraits,
    6,
    ARRAY['directeur photo', 'portrait', 'FIFM', 'Ouarzazate']
  ),
  (
    gen_random_uuid()::text,
    'construire-portfolio-metier-du-cinema',
    'Comment construire un portfolio convaincant dans les métiers du cinéma',
    'Du dossier de presse papier au profil numérique : guide pratique pour valoriser votre parcours et décrocher vos prochains projets.',
    '<p>Dans l''industrie audiovisuelle marocaine en plein essor, la qualité de votre portfolio peut faire la différence entre décrocher un contrat sur une co-production internationale et rester sur le banc de touche. Voici les règles du jeu.</p>

<h2>Définir son positionnement avant tout</h2>
<p>Avant de compiler vos réalisations, posez-vous une question fondamentale : pour quel type de projets voulez-vous être contacté ? Un monteur qui cible les publicités institutionnelles n''aura pas le même portfolio qu''un monteur spécialisé en documentaire ethnographique.</p>
<p>Cette clarté est d''autant plus importante sur Plateau, où les recruteurs filtrent par métier et par type de production. Un profil trop généraliste dilue votre impact.</p>

<h2>Les trois piliers d''un portfolio solide</h2>
<p>Chaque profil professionnel crédible repose sur trois éléments :</p>
<ul>
  <li><strong>Une sélection courageuse :</strong> mieux vaut cinq projets exceptionnels que quinze projets médiocres. Les recruteurs parcourent des dizaines de profils par semaine.</li>
  <li><strong>Des références vérifiables :</strong> mentionnez le titre du film ou de la série, le réalisateur, l''année, votre rôle précis. Rien ne nuit plus à la crédibilité qu''un CV vague.</li>
  <li><strong>Un extrait ou une démo récente :</strong> pour les métiers techniques, une séquence de deux à trois minutes vaut mieux qu''un long discours.</li>
</ul>

<h2>L''importance de la photo de profil</h2>
<p>Cela peut sembler superficiel, mais une photo professionnelle — simple, neutre, lumineuse — augmente significativement les demandes de contact sur les plateformes professionnelles. « On recrute d''abord une énergie, ensuite une compétence. »</p>

<blockquote>Un bon portfolio ne montre pas tout ce que vous savez faire — il montre ce que vous voulez faire.</blockquote>

<h2>Mettre à jour régulièrement</h2>
<p>Un portfolio figé donne l''impression d''une carrière figée. Visez une mise à jour après chaque projet significatif. Sur Plateau, vous pouvez mettre à jour votre agenda de disponibilité en temps réel — une fonctionnalité très appréciée des directeurs de casting.</p>',
    'PUBLISHED',
    NOW() - INTERVAL '12 days',
    v_author_id,
    v_cat_guides,
    8,
    ARRAY['portfolio', 'carrière', 'conseils', 'profil']
  ),
  (
    gen_random_uuid()::text,
    'festival-cinema-africain-tanger-2026',
    'Festival du Cinéma Africain de Tanger : les films à ne pas manquer',
    'La sélection officielle de la 14e édition révèle une nouvelle génération de cinéastes africains qui dialoguent avec leur histoire et leur présent.',
    '<p>Tanger, ville de passages et de confluences, accueille cette année une édition particulièrement dense du Festival du Cinéma Africain. Cinquante-deux films en compétition, dix-sept pays représentés, et une thématique centrale qui traverse l''ensemble de la programmation : la mémoire des corps.</p>

<h2>La compétition officielle</h2>
<p>Six longs-métrages se disputent le Grand Atlas. Parmi eux, le film marocain <em>Azul N''Smayen</em> de Sofia Alaoui fait figure de favori. La réalisatrice, révélée par son court-métrage primé à Sundance, livre ici une fable contemporaine tournée entre Tiznit et le désert d''Erg Chebbi. La direction photo de Zakaria Mansouri y est d''une beauté saisissante.</p>

<p>Du côté du Sénégal, <em>Les Enfants du Fleuve</em> de Moussa Sène Absa confirme que Dakar s''impose comme un nouveau pôle de création cinématographique sur le continent.</p>

<h2>La section Panorama</h2>
<p>C''est souvent dans les sections parallèles que se nichent les vraies découvertes. Cette année, la section Panorama présente une rétrospective du cinéma amazigh — un genre qui gagne en visibilité et en qualité de production.</p>

<blockquote>Le cinéma africain n''a plus besoin de se définir en opposition au cinéma occidental. Il a ses propres langages, ses propres urgences.</blockquote>

<h2>Masterclasses et rencontres professionnelles</h2>
<p>En marge de la compétition, les professionnels pourront assister à des masterclasses animées par des figures établies : Daoud Aoulad Syad, Farida Benlyazid et la monteuse franco-marocaine Nadia Rais. Un espace de networking sera également disponible pour faciliter les rencontres entre producteurs africains et coproducteurs européens.</p>',
    'PUBLISHED',
    NOW() - INTERVAL '2 days',
    v_author_id,
    v_cat_actu,
    5,
    ARRAY['festival', 'Tanger', 'cinéma africain', 'sélection']
  ),
  (
    gen_random_uuid()::text,
    'tournage-desert-erg-chebbi-production-internationale',
    'Dans les dunes : sur le tournage d''une coproduction franco-marocaine à Erg Chebbi',
    'Trois semaines avec l''équipe du film « Insomnies de sable » de Jules Laroche, une immersion dans les défis logistiques et humains d''un tournage en milieu extrême.',
    '<p>Cinq heures du matin, le soleil est encore absent mais la lumière commence à teinter l''horizon de rose et d''ocre. Sur le site de tournage, à douze kilomètres de Merzouga, l''équipe est déjà en place. Les machinistes marocains montent les rails de travelling pendant que l''équipe image règle les mesures de lumière. Dans une heure, le moment d''or sera là — et il durera exactement vingt-deux minutes.</p>

<h2>La logistique du désert</h2>
<p>Tourner dans l''Erg Chebbi, c''est d''abord un défi logistique hors normes. Le sable pénètre partout. Les caméras Arri Alexa 35 sont protégées par des housses spéciales. Chaque objectif est nettoyé entre chaque prise. La chaleur en journée dépasse les 45 degrés — ce qui force l''équipe à travailler en deux fenêtres : l''aube et le crépuscule.</p>
<p>La production a fait appel à des fixeurs locaux pour les autorisations, la logistique en 4x4 et les relations avec les communautés nomades dont certains terrains sont utilisés.</p>

<h2>Le casting local</h2>
<p>Dix des vingt-deux rôles du film sont tenus par des acteurs marocains, dont plusieurs sans formation académique mais avec une présence cinématographique remarquable. « Ils apportent une authenticité que vous ne pouvez pas jouer, vous devez la trouver ou vous passer », explique le réalisateur Jules Laroche.</p>

<blockquote>Le désert n''est pas un décor. C''est un personnage à part entière, et il faut le traiter avec le même respect qu''un acteur principal.</blockquote>

<h2>Un modèle de coproduction exemplaire</h2>
<p>Ce tournage illustre ce que peut être une coproduction équitable : une équipe mixte, des techniciens marocains aux postes de chef opérateur, régisseur général et directeur artistique, et un budget partagé qui bénéficie réellement à l''économie locale. Un modèle à généraliser.</p>',
    'PUBLISHED',
    NOW() - INTERVAL '8 days',
    v_author_id,
    v_cat_tournages,
    7,
    ARRAY['tournage', 'désert', 'coproduction', 'Merzouga']
  );

END $$;
