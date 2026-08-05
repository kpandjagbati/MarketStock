# MarketStock — Application de gestion de stock

Basée sur [asso-stock](https://github.com/sadikou-faiz/asso-stock), avec les thèmes DaisyUI :

- **Mode clair** : `cmyk`
- **Mode sombre** : `night`

## Prérequis

- Node.js 18+
- Un compte [Clerk](https://clerk.com) pour l’authentification

## Installation

```bash
npm install
cp .env.example .env
```

Renseignez les variables dans `.env` :

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

Puis initialisez la base et lancez l’app :

```bash
npx prisma migrate dev
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Fonctionnalités

- Tableau de bord (stats, graphiques, transactions récentes)
- Gestion des produits et catégories
- Alimentation du stock
- Dons / sorties de stock
- Historique des transactions
- Authentification Clerk
- Bascule clair / sombre (cmyk ↔ night)
