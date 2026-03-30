# 🚀 IASN - Crée ton site internet en 1 minute

Plateforme de création de sites web ultra-simple, conçue pour les entrepreneurs africains. **Zéro confusion, 1 action à la fois, utilisable par tous.**

![IASN Platform](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)

---

## ✨ Fonctionnalités

### 📱 Pour les clients
- **Création en 5 étapes simples** : Nom → Activité → Ville → Adresse → WhatsApp
- **Site généré automatiquement** avec page personnalisée
- **Dashboard client** pour gérer son site et ses paiements
- **Période d'essai de 7 jours** gratuite

### 🛠️ Pour l'admin
- **Tableau de bord** avec statistiques (clients, sites actifs, revenus)
- **Gestion des paiements** (valider, marquer en retard)
- **Contact direct via WhatsApp** avec chaque client

---

## 🎨 Design

- ✅ **Ultra simple** - 1 action par écran
- ✅ **Gros boutons** - Faciles à toucher
- ✅ **Texte court** - Zéro confusion
- ✅ **Mobile-first** - Responsive
- ✅ **Accessible** - Pour tous les niveaux de lecture

---

## 🛠️ Stack Technique

| Technologie | Usage |
|-------------|-------|
| **Next.js 16** | Framework React avec App Router |
| **TypeScript** | Typage statique |
| **Tailwind CSS 4** | Styling |
| **shadcn/ui** | Composants UI |
| **Prisma ORM** | Base de données |
| **SQLite** | Stockage de données |
| **Lucide React** | Icônes |

---

## 📦 Installation

### Prérequis
- Node.js 18+ ou Bun
- Git

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/abdoulaye87/pointsn.git
cd pointsn

# 2. Installer les dépendances
bun install
# ou
npm install

# 3. Configurer la base de données
bun run db:push
# ou
npx prisma db push

# 4. Lancer le serveur de développement
bun run dev
# ou
npm run dev
```

### Accès
- **Application** : http://localhost:3000
- **Admin** : Cliquer sur ⚙️ en haut à droite

---

## 📱 Écrans de l'application

### Flow Client

| Écran | Description |
|-------|-------------|
| **Accueil** | Illustration + "Crée ton site internet en 1 minute" |
| **Étape 1/5** | Nom de l'activité |
| **Étape 2/5** | Type d'activité (Restaurant, Coiffure, Immobilier, Boutique, Autre) |
| **Étape 3/5** | Ville |
| **Étape 4/5** | Adresse |
| **Étape 5/5** | Numéro WhatsApp |
| **Chargement** | Animation de création |
| **Résultat** | Lien du site généré |
| **Dashboard** | Gestion du site et paiements |

### Site généré

Chaque client obtient une page personnalisée `/site/[slug]` avec :
- 🎨 Bannière colorée selon l'activité
- 📍 Carte Localisation
- 📞 Carte Contact
- 🕐 Carte Horaires
- 💬 Bouton WhatsApp flottant

---

## 🎯 Couleurs par activité

| Activité | Couleur | Emoji |
|----------|---------|-------|
| Restaurant | Orange | 🍽️ |
| Coiffure | Rose | 💇 |
| Immobilier | Bleu | 🏠 |
| Boutique | Violet | 🛍️ |
| Autre | Vert | ✨ |

---

## 📊 Modèle de données

```
Client
├── id          (identifiant unique)
├── name        (nom de l'activité)
├── activity    (type d'activité)
├── city        (ville)
├── address     (adresse)
├── whatsapp    (numéro WhatsApp)
├── slug        (URL du site)
├── paymentStatus (trial/active/late)
└── trialEndsAt (fin de période d'essai)

Payment
├── id
├── clientId
├── amount      (2000 FCFA)
└── status

Modification
├── id
├── clientId
├── request     (demande de modification)
└── status
```

---

## 🚀 Déploiement

### Vercel (recommandé)

1. Créer un compte sur [vercel.com](https://vercel.com)
2. Connecter votre GitHub
3. Importer le repository `abdoulaye87/pointsn`
4. Déploiement automatique !

### Variables d'environnement (production)

```env
DATABASE_URL="file:./db/custom.db"
```

---

## 💰 Modèle économique

- **Prix** : 2 000 FCFA / mois
- **Essai gratuit** : 7 jours
- **Paiement** : À valider manuellement par l'admin

---

## 📞 Contact

Pour toute question ou suggestion :
- **GitHub** : [@abdoulaye87](https://github.com/abdoulaye87)
- **Repository** : [pointsn](https://github.com/abdoulaye87/pointsn)

---

## 📄 Licence

MIT License - Libre d'utilisation et de modification.

---

<div align="center">

**Fait avec ❤️ pour les entrepreneurs africains**

</div>
