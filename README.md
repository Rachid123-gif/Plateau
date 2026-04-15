# Plateau. — Plateforme du Cinema et de l'Audiovisuel

Plateforme professionnelle dediee aux metiers du cinema et de l'audiovisuel au Maroc. Annuaire, portfolios, mise en relation.

## Fonctionnalites

### MVP implemente

- **Authentification complete** : inscription, connexion, recuperation mot de passe, gestion roles
- **Profils professionnels** : creation, edition, photo, bio, competences, experiences, formation, portfolio
- **Referentiel metiers** : 20+ professions organisees en 8 categories, avec noms en arabe
- **Calendrier de disponibilite** : statut rapide + slots de disponibilite par dates
- **Recherche multicritere** : par metier, ville, langue, disponibilite, niveau, mot-cle (PostgreSQL full-text)
- **Mise en relation** : demandes de contact entre recruteurs et professionnels
- **Backoffice** : validation profils, gestion referentiels, statistiques, moderation
- **Pages publiques** : accueil, annuaire, profil public
- **6 roles utilisateurs** : Administrateur, Moderateur, Professionnel, Recruteur, Institution, Visiteur

### Roles et permissions

| Role | Acces |
|------|-------|
| Administrateur | Gestion complete, validation, referentiels, statistiques |
| Moderateur | Validation profils, moderation contenu |
| Professionnel | Son profil, agenda, demandes recues |
| Recruteur | Recherche avancee, demandes de contact, favoris |
| Institution | Vue laureats |
| Visiteur | Recherche limitee, profils publics partiels |

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Framework | Next.js 16 (App Router) |
| Base de donnees | PostgreSQL (via Supabase) |
| ORM | Prisma 7 |
| Authentification | Supabase Auth |
| Storage | Supabase Storage |
| UI | Tailwind CSS + shadcn/ui |
| Validation | Zod |
| Langage | TypeScript |

## Prerequis

- Node.js 20.9+
- Un projet [Supabase](https://supabase.com) (gratuit pour commencer)

## Installation

### 1. Installer les dependances

```bash
cd ccm-platform
npm install
```

### 2. Configurer Supabase

1. Creer un projet sur [supabase.com](https://supabase.com)
2. Copier le fichier d'environnement :

```bash
cp .env.example .env.local
```

3. Remplir les variables avec vos identifiants Supabase :
   - `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Cle publique (anon)
   - `SUPABASE_SERVICE_ROLE_KEY` : Cle de service (Settings > API)
   - `DATABASE_URL` : URL de connexion pooling (Settings > Database > Connection string > URI > Transaction mode)
   - `DIRECT_URL` : URL de connexion directe (Settings > Database > Connection string > URI > Session mode)

### 3. Initialiser la base de donnees

```bash
# Pousser le schema vers la base de donnees
npm run db:push

# Generer le client Prisma
npm run db:generate

# Remplir les donnees de reference (metiers, competences, langues, institutions)
npm run db:seed
```

### 4. Lancer le serveur de developpement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### 5. Creer un compte admin

1. S'inscrire via l'interface `/inscription`
2. Dans le dashboard Supabase > SQL Editor, executer :

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'votre-email@example.com';
```

## Structure du projet

```
ccm-platform/
├── prisma/
│   ├── schema.prisma          # Schema de base de donnees
│   └── seed.ts                # Donnees initiales
├── src/
│   ├── app/
│   │   ├── (public)/          # Pages publiques (accueil, annuaire, profil)
│   │   ├── (auth)/            # Pages authentification
│   │   ├── dashboard/         # Espace professionnel
│   │   ├── recruteur/         # Espace recruteur
│   │   ├── admin/             # Backoffice Plateau
│   │   └── api/               # API Routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui
│   │   ├── layout/            # Header, Footer, Sidebars
│   │   └── shared/            # Composants partages
│   ├── lib/
│   │   ├── prisma.ts          # Client Prisma singleton
│   │   ├── supabase/          # Clients Supabase
│   │   ├── auth.ts            # Helpers authentification
│   │   ├── permissions.ts     # RBAC
│   │   ├── validations/       # Schemas Zod
│   │   └── constants.ts       # Constantes
│   ├── hooks/                 # React hooks
│   └── types/                 # Types TypeScript
├── prisma.config.ts           # Config Prisma 7
├── .env.example               # Template variables d'environnement
└── package.json
```

## API Routes

| Route | Methode | Description |
|-------|---------|-------------|
| `/api/auth/signup` | POST | Inscription |
| `/api/auth/callback` | GET | Callback confirmation email |
| `/api/profiles` | GET/POST | Liste/creation profils |
| `/api/profiles/[id]` | GET/PUT/DELETE | CRUD profil |
| `/api/profiles/me` | GET/PUT | Profil de l'utilisateur connecte |
| `/api/professions` | GET | Referentiel metiers |
| `/api/skills` | GET | Referentiel competences |
| `/api/languages` | GET | Langues disponibles |
| `/api/availability` | GET/POST | Slots de disponibilite |
| `/api/availability/[id]` | DELETE | Supprimer un slot |
| `/api/contact-requests` | GET/POST | Demandes de contact |
| `/api/contact-requests/[id]` | PUT | Accepter/refuser |
| `/api/search` | GET | Recherche multicritere |
| `/api/admin/stats` | GET | Statistiques plateforme |
| `/api/admin/profiles/[id]/verify` | POST | Valider/rejeter profil |
| `/api/admin/professions` | POST | Creer metier |
| `/api/admin/professions/[id]` | PUT/DELETE | Modifier/supprimer metier |
| `/api/admin/institutions` | GET/POST | CRUD institutions |

## Donnees de seed

Le seed (`prisma/seed.ts`) cree :
- **8 categories de metiers** : Interpretation, Realisation & Production, Technique Image & Son, Post-production, Ecriture & Scenographie, Decoration/Costume/Maquillage, Animation & VFX, Regie & Coordination
- **20 professions** avec noms en arabe
- **30 competences** en 5 categories
- **10 langues** (Arabe, Darija, Francais, Anglais, Amazigh, etc.)
- **6 institutions** (ISADAC, ISMAC, ESAV, CCM, SNRT, 2M)

## Roadmap

### V2 (prochaine phase)
- Messagerie interne
- Publication de projets / appels a casting
- Favoris et shortlists avancees
- Notifications email (Resend)
- Meilisearch pour recherche avancee
- Analytics profil (qui a vu mon profil)

### V3
- Matching intelligent profils/projets
- API publique partenaires
- Application mobile (React Native)
- Integration WhatsApp/SMS
- Multi-langue (fr/ar/en)
- Recommandation automatique

## Scripts

```bash
npm run dev          # Serveur de developpement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Linter
npm run db:generate  # Generer client Prisma
npm run db:push      # Pousser schema vers DB
npm run db:migrate   # Creer migration
npm run db:seed      # Remplir donnees initiales
npm run db:studio    # Ouvrir Prisma Studio
```

## Licence

Proprietaire - Plateau
