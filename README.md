<div align="center">

---

## 📖 Présentation

**CoFlow** est une solution complète de gestion de projet pensée pour les équipes modernes, les startups et les freelances. Elle combine la simplicité d'un tableau Kanban interactif, la puissance de collaboration multi-utilisateurs au sein d'espaces de travail (Workspaces) dédiés, et un modèle de monétisation prêt pour la production (avec intégration de **Mobile Money** et **Cartes Bancaires** via **Notch Pay**).

---

## ✨ Fonctionnalités Clés

### 🏢 Espaces de Travail (Workspaces) & Rôles

- Création et gestion d'espaces de travail indépendants.
- **Système d'invitations multi-utilisateurs** : invitation par lien unique partageable et/ou notification par email.
- Gestion granulaire des rôles : **Admin**, **Membre**, et **Lecteur (Viewer)**.
- Quotas dynamiques par plan : **Starter** (jusqu'à 5 membres par workspace) et **Pro** (membres illimités).

### 📂 Projets Collaboratifs

- Organisation de projets par espace de travail.
- Suivi de l'avancement, échéances, statuts (*À faire*, *En cours*, *Terminé*) et niveaux de priorité (*Basse*, *Moyenne*, *Haute*, *Urgente*).
- Visibilité partagée pour l'ensemble des membres de l'espace.

### 📋 Tâches, Assignations & Tableaux Kanban

- Création et modification de tâches en temps réel avec sous-tâches (checklists).
- Assignation multi-membres parmi les collaborateurs de l'espace de travail.
- Vues en **Tableau Kanban** glisser-déposer et en **Liste**.
- Fil de commentaires collaboratifs et journal d'activité par tâche.

### 👥 Annuaire d'Équipe (`/members`)

- Consultation de tous les membres et collaborateurs par espace.
- Interface d'invitation directe avec sélection du rôle et copie instantanée du lien d'invitation.

### 🛡️ Sécurité & Performance Enterprise

- Authentification complète JWT avec chiffrement des mots de passe via `bcrypt`.
- Vérification d'email par code et procédure sécurisée de réinitialisation de mot de passe.
- Protection anti-bot, rate limiting et analyse d'attaque avec **Arcjet**.
- Middleware d'authentification robuste avec Next.js 15+ proxying & SSR.

### 💳 Monétisation & Abonnements (Notch Pay)

- Passerelle de paiement intégrée avec **Notch Pay** :
  - Prise en charge directe de **MTN Mobile Money** et **Orange Money** (Cameroun & zone CEMAC).
  - Cartes bancaires internationales (**Visa**, **Mastercard**).
- Mode Sandbox automatique en développement et webhooks de confirmation de paiement.

---

## 🏗️ Architecture du Monorepo

Le projet est structuré sous forme de monorepo npm :

```plaintext
coflow/
├── backend/                  # API REST Node.js / Express v5 en TypeScript
│   ├── src/
│   │   ├── config/           # Connexion DB (Mongoose), Arcjet, Nodemailer
│   │   ├── controllers/      # Logique métier (Auth, Workspace, Project, Task, Payment, User)
│   │   ├── middleware/       # Auth JWT, validation Zod, gestion d'erreurs
│   │   ├── models/           # Schémas Mongoose (User, Workspace, Project, Task, etc.)
│   │   ├── routes/           # Définition des routes Express
│   │   └── seed.ts           # Script de peuplement de données de test
│   └── package.json
│
├── frontend/                 # Application Web Next.js 15+ (App Router, React 19)
│   ├── src/
│   │   ├── app/              # Routes Next.js (Dashboard, Auth, Workspaces, Projects, Tasks)
│   │   │   ├── (auth)/       # Pages de connexion, inscription, activation, reset mot de passe
│   │   │   ├── (dashboard)/  # Tableau de bord, workspaces, projets, tâches, membres, profil
│   │   │   └── workspace-invite/ # Page publique d'accueil et d'acceptation d'invitation
│   │   ├── components/       # Composants UI Radix/Tailwind (Modales, Kanban, Navbar, etc.)
│   │   ├── hooks/            # Hooks React personnalisés (TanStack Query, auth, responsive)
│   │   ├── lib/              # Clients API, configurations, utilitaires
│   │   └── types/            # Types TypeScript frontend
│   └── package.json
│
├── packages/
│   └── types/                # Types TypeScript partagés entre frontend et backend
│
├── docker-compose.yml        # Déploiement multi-conteneurs (Mongo, Backend, Frontend)
├── start-dev.bat             # Lanceur rapide Windows (Backend + Frontend)
└── package.json              # Définition du workspace racine et scripts globaux
```

---

## 💻 Stack Technique

| Domaine                           | Technologies                                                                                                                                                                                                                                                                                                                          |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Frontend**                | [Next.js 15+](https://nextjs.org/) (App Router, Turbopack), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [TanStack Query v5](https://tanstack.com/query), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/), [Recharts](https://recharts.org/) |
| **Backend**                 | [Node.js](https://nodejs.org/) (ES Modules), [Express v5](https://expressjs.com/), [TypeScript 5](https://www.typescriptlang.org/), [Mongoose 8](https://mongoosejs.com/)                                                                                                                                                                 |
| **Base de Données**        | [MongoDB Atlas](https://www.mongodb.com/atlas) / MongoDB 7                                                                                                                                                                                                                                                                             |
| **Sécurité & Protection** | [Arcjet](https://arcjet.com/) (Rate Limiting, Bot Protection, Shield), [JWT](https://jwt.io/), [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)                                                                                                                                                                                      |
| **Notifications & Emails**  | [Nodemailer](https://nodemailer.com/) (Gmail SMTP / Brevo), [SendGrid](https://sendgrid.com/)                                                                                                                                                                                                                                           |
| **Paiements**               | [Notch Pay](https://notchpay.co/) (Mobile Money MTN / Orange, Cartes Visa / Mastercard)                                                                                                                                                                                                                                                |
| **Validation**              | [Zod](https://zod.dev/), [React Hook Form](https://react-hook-form.com/)                                                                                                                                                                                                                                                                |

---

## ⚡ Démarrage Rapide

### Prérequis

- [Node.js](https://nodejs.org/) version 20 ou supérieure
- [npm](https://www.npmjs.com/) version 10+
- Un cluster [MongoDB Atlas](https://www.mongodb.com/) (ou MongoDB local)

### 1. Cloner le Répertoire

```bash
git clone https://github.com/votre-compte/coflow.git
cd coflow
```

### 2. Installer les Dépendances

Installez l'ensemble des dépendances du monorepo en une seule commande :

```bash
npm install
```

### 3. Configurer les Fichiers d'Environnement

Créez le fichier `backend/.env` :

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/coflow?retryWrites=true&w=majority
JWT_SECRET=votre_cle_secrete_jwt_super_securisee
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Envoi d'emails (Option 1 : Gmail avec mot de passe d'application)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application-16-lettres
FROM_EMAIL=votre-email@gmail.com

# Protection Arcjet (obtenez une clé gratuite sur arcjet.com)
ARCJET_ENV=development
ARCJET_KEY=ajkey_your_key_here

# Paiement Notch Pay (optionnel, Sandbox actif si vide)
NOTCHPAY_PUBLIC_KEY=
NOTCHPAY_HASH_KEY=
PRO_PRICE_XAF=6500
PRO_PRICE_EUR=10
```

Créez le fichier `frontend/.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

> **Note Réseau MongoDB Atlas** : Assurez-vous que votre adresse IP actuelle est autorisée dans la section **Network Access** de votre console MongoDB Atlas (ou ajoutez `0.0.0.0/0` pour le développement).

### 4. Démarrer les Serveurs

#### Option A — Démarrage Global via npm

```bash
# Lance le backend et le frontend simultanément
npm run dev
```

#### Option B — Démarrage sous Windows (Recommandé)

Double-cliquez simplement sur `start-dev.bat` ou lancez :

```cmd
.\start-dev.bat
```

#### Option C — Démarrage par Espace de Travail

```bash
# Terminal 1 : Backend API (http://localhost:5000)
npm run dev:backend

# Terminal 2 : Frontend Next.js (http://localhost:3000)
npm run dev:frontend
```

---

## 🐳 Déploiement avec Docker

Un fichier `docker-compose.yml` est inclus pour lancer l'infrastructure complète avec MongoDB local :

```bash
# Démarrer tous les services en arrière-plan
docker compose up -d --build

# Consulter les logs
docker compose logs -f

# Arrêter les conteneurs
docker compose down
```

---

## 🤝 Système d'Invitations & Collaboration

CoFlow intègre un flux complet de collaboration d'équipe :

1. **Invitation directe par Email** : Depuis un workspace (`/workspaces/[id]`) ou la vue membres (`/members`), cliquez sur **Inviter un membre**.
2. **Attribution de Rôle** : Définissez les permissions du collaborateur (*Membre*, *Admin*, *Lecteur*).
3. **Lien Sécurisé Unique** : L'expéditeur peut copier immédiatement un lien d'invitation direct généré avec jeton chiffré (`/workspace-invite/:workspaceId?tk=...`). Un email est également expédié via SMTP / SendGrid.
4. **Acceptation & Onboarding** :
   - Si le collaborateur a déjà un compte : il clique sur **Accepter l'invitation** et intègre l'espace de travail immédiatement.
   - Si le collaborateur est un nouvel utilisateur : la page lui propose de s'inscrire ou se connecter, puis le redirige automatiquement pour valider l'invitation.
5. **Collaboration Multi-Projets** : Tous les membres acceptés peuvent consulter les projets de l'espace, visualiser les tâches et être assignés comme responsables.

---

## 💳 Abonnements & Paiements (Notch Pay)

CoFlow propose un système de tarification freemium :

| Plan              | Prix              | Quotas & Fonctionnalités                                                     |
| :---------------- | :---------------- | :---------------------------------------------------------------------------- |
| **Starter** | Gratuit           | Jusqu'à 5 membres par workspace, projets illimités, tableau Kanban standard |
| **Pro**     | 6 500 XAF / 10 € | Membres illimités, support prioritaire, analyses avancées                   |

### Moyens de Paiement Pris en Charge

- 🇨🇲 **MTN Mobile Money**
- 🇨🇲 **Orange Money**
- 💳 **Cartes Bancaires (Visa / Mastercard)**
- 🧪 **Sandbox Intégrée** : Pour tester en local sans créer de compte marchand, laissez les clés Notch Pay vides dans `.env` : les paiements de test simulent une confirmation instantanée !

---

## 🛠️ Scripts Disponibles

| Commande                       | Description                                                                       |
| :----------------------------- | :-------------------------------------------------------------------------------- |
| `npm run dev`                | Démarre simultanément le backend et le frontend en mode développement          |
| `npm run dev:backend`        | Démarre uniquement le serveur backend avec rechargement à chaud (`tsx watch`) |
| `npm run dev:frontend`       | Démarre l'application Next.js avec Turbopack                                     |
| `npm run build:backend`      | Compile le code TypeScript du backend (`tsc`)                                   |
| `npm run build:frontend`     | Génère la version de production de Next.js (`next build`)                     |
| `npm run typecheck:backend`  | Vérifie les types TypeScript du backend sans émettre de fichiers                |
| `npm run typecheck:frontend` | Vérifie les types TypeScript du frontend sans émettre de fichiers               |
| `npm run seed`               | Peuple la base de données avec des utilisateurs, projets et tâches d'exemple    |
| `npm run test:db`            | Teste la connectivité avec la base de données MongoDB                           |

---

## 📄 Licence

Ce projet est sous licence propriétaire pour **CoFlow**. Tous droits réservés.
