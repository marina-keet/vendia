# Architecture du Projet

## 📁 Structure des dossiers

```
vendia/
├── database/
│   ├── init.js              # Initialisation de la base de données SQLite
│   └── commerce.db          # Base de données (généré automatiquement)
│
├── node_modules/            # Dépendances npm
│
├── public/                  # Fichiers statiques
│   └── style.css            # Styles CSS personnalisés
│
├── receipts/                # Reçus PDF générés (créé automatiquement)
│
├── routes/                  # Routes API Express
│   ├── products.js          # CRUD produits
│   ├── sales.js             # Gestion des ventes
│   └── reports.js           # Rapports et statistiques
│
├── utils/                   # Utilitaires
│   └── receipt.js           # Génération de reçus PDF
│
├── views/                   # Templates EJS
│   ├── partials/
│   │   ├── header.ejs       # En-tête commun (navigation)
│   │   └── footer.ejs       # Pied de page commun
│   ├── index.ejs            # Dashboard
│   ├── products.ejs         # Gestion des produits
│   ├── pos.ejs              # Point de vente (caisse)
│   └── reports.ejs          # Rapports et statistiques
│
├── .gitignore               # Fichiers ignorés par Git
├── config.js                # Configuration de l'application
├── GUIDE_UTILISATEUR.md     # Guide utilisateur complet
├── maintenance.js           # Scripts de maintenance
├── package.json             # Dépendances et scripts npm
├── README.md                # Documentation principale
├── server.js                # Point d'entrée de l'application
└── TESTS.md                 # Guide de tests
```

---

## 🗄️ Schéma de base de données

### Table `products`
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  barcode TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table `sales`
```sql
CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total_amount REAL NOT NULL,
  discount REAL DEFAULT 0,
  final_amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);
```

### Table `sale_items`
```sql
CREATE TABLE sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Table `payments`
```sql
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL,
  method TEXT NOT NULL,
  amount REAL NOT NULL,
  reference TEXT,
  status TEXT DEFAULT 'completed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id)
);
```

---

## 🔌 API Endpoints

### Produits (`/api/products`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/products` | Liste tous les produits |
| GET | `/api/products/:id` | Récupère un produit par ID |
| POST | `/api/products` | Crée un nouveau produit |
| PUT | `/api/products/:id` | Met à jour un produit |
| DELETE | `/api/products/:id` | Supprime un produit |
| GET | `/api/products/meta/categories` | Liste les catégories |
| GET | `/api/products/search/barcode/:barcode` | Recherche par code-barres |

**Paramètres query disponibles pour GET /api/products :**
- `category` : Filtrer par catégorie
- `search` : Rechercher dans nom ou code-barres

### Ventes (`/api/sales`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/sales` | Crée une nouvelle vente |
| GET | `/api/sales` | Liste toutes les ventes |
| GET | `/api/sales/:id` | Récupère une vente par ID |
| GET | `/api/sales/:id/receipt` | Génère et télécharge le reçu PDF |

**Paramètres query disponibles pour GET /api/sales :**
- `startDate` : Date de début (YYYY-MM-DD)
- `endDate` : Date de fin (YYYY-MM-DD)
- `paymentMethod` : Filtrer par méthode de paiement
- `limit` : Nombre maximum de résultats (défaut: 50)

### Rapports (`/api/reports`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/reports/stats` | Statistiques globales |
| GET | `/api/reports/sales-by-day` | Ventes par jour |
| GET | `/api/reports/payment-methods` | Ventes par méthode de paiement |
| GET | `/api/reports/top-products` | Produits les plus vendus |
| GET | `/api/reports/sales-by-category` | Ventes par catégorie |
| GET | `/api/reports/detailed` | Rapport détaillé des ventes |

**Paramètres query disponibles :**
- `days` : Nombre de jours pour sales-by-day (défaut: 30)
- `limit` : Limite pour top-products (défaut: 10)
- `startDate` / `endDate` : Filtres de date pour detailed

---

## 🎨 Frontend - Technologies

### Frameworks & Librairies
- **Tailwind CSS** : Framework CSS utility-first
- **Chart.js** : Graphiques et visualisations
- **Font Awesome** : Icônes
- **EJS** : Moteur de templates

### Pages principales

#### 1. Dashboard (`index.ejs`)
- Statistiques en temps réel
- Graphiques des ventes
- Raccourcis rapides

#### 2. Gestion Produits (`products.ejs`)
- Table CRUD complète
- Recherche et filtres
- Modal d'ajout/modification

#### 3. Point de Vente (`pos.ejs`)
- Grille de produits
- Panier dynamique
- Validation de vente
- Modal de confirmation

#### 4. Rapports (`reports.ejs`)
- Filtres de date
- Statistiques agrégées
- Graphiques multiples
- Export CSV
- Historique des ventes

---

## 🔄 Flux de données

### Flux de création de vente

```
1. Utilisateur sélectionne produits → Panier frontend
2. Clic "Valider" → POST /api/sales
3. Backend vérifie stocks
4. Transaction SQLite :
   - INSERT dans sales
   - INSERT dans sale_items (pour chaque article)
   - UPDATE products (décrémenter stocks)
   - INSERT dans payments
5. Commit ou Rollback
6. Retour ID de vente → Frontend
7. Option d'impression → GET /api/sales/:id/receipt
8. Génération PDF → Téléchargement
```

### Flux de génération de rapport

```
1. Utilisateur définit filtres (dates)
2. GET /api/reports/detailed?startDate=...&endDate=...
3. Backend :
   - Query SQL avec filtres
   - Agrégation des données
4. Retour JSON
5. Frontend :
   - Affichage tableau
   - Génération graphiques Chart.js
   - Option export CSV (côté client)
```

---

## 🛡️ Gestion des erreurs

### Backend (Express)
- Validation des données entrantes
- Try-catch pour opérations DB
- Codes HTTP appropriés (400, 404, 500)
- Messages d'erreur descriptifs

### Frontend (JavaScript)
- Vérification des champs avant envoi
- Gestion des réponses d'erreur
- Alertes utilisateur
- Rollback UI si nécessaire

---

## 🔐 Sécurité

### Mesures actuelles
- Validation des entrées
- Transactions SQLite (ACID)
- Pas de SQL injection (paramétrisé)

### À ajouter pour production
- [ ] Authentification utilisateur (JWT)
- [ ] Rate limiting
- [ ] HTTPS
- [ ] CORS configuré
- [ ] Validation côté serveur renforcée
- [ ] Logs d'audit
- [ ] Chiffrement des données sensibles

---

## 📊 Performance

### Optimisations actuelles
- Index sur code-barres (UNIQUE)
- Requêtes SQL optimisées
- Limite sur nombre de résultats
- Transactions pour atomicité

### Optimisations futures
- [ ] Cache Redis pour stats
- [ ] Pagination côté serveur
- [ ] Compression des réponses
- [ ] CDN pour assets statiques
- [ ] Lazy loading des images produits

---

## 🧪 Tests

### Types de tests à implémenter
- [ ] Tests unitaires (routes, utils)
- [ ] Tests d'intégration (API endpoints)
- [ ] Tests E2E (Playwright/Cypress)
- [ ] Tests de charge (Artillery)

### Outils recommandés
- Jest pour tests unitaires
- Supertest pour tests API
- Playwright pour tests E2E

---

## 🚀 Déploiement

### Options de déploiement

#### 1. Serveur dédié (VPS)
```bash
# Installation PM2 pour gestion des processus
npm install -g pm2
pm2 start server.js --name commerce
pm2 startup
pm2 save
```

#### 2. Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

#### 3. Hébergement cloud
- Heroku
- DigitalOcean App Platform
- Railway
- Render

### Variables d'environnement
```bash
PORT=3000
NODE_ENV=production
DATABASE_PATH=./database/commerce.db
```

---

## 📝 Conventions de code

### JavaScript
- Utiliser `const` et `let`, éviter `var`
- Noms de variables en camelCase
- Fonctions documentées avec JSDoc
- Async/await pour asynchrone

### SQL
- Noms de tables au pluriel
- Colonnes en snake_case
- Toujours utiliser des paramètres préparés

### CSS
- Classes Tailwind en priorité
- Custom CSS dans public/style.css
- Mobile-first responsive

---

## 🔧 Maintenance

### Tâches régulières
- Sauvegarder la base de données (quotidien)
- Nettoyer les anciens reçus (mensuel)
- Vérifier les logs d'erreur (quotidien)
- Mettre à jour les dépendances (mensuel)

### Scripts disponibles
```bash
node maintenance.js backup          # Sauvegarde DB
node maintenance.js stats            # Stats DB
node maintenance.js clean-receipts   # Nettoyer reçus
node maintenance.js clear-sales      # Vider ventes
node maintenance.js reset            # Reset complet
```

---

## 📚 Ressources

### Documentation
- [Express.js](https://expressjs.com/)
- [SQLite](https://www.sqlite.org/docs.html)
- [EJS](https://ejs.co/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [PDFKit](https://pdfkit.org/)

### Extensions possibles
- Gestion multi-utilisateurs
- Module de facturation
- Intégration comptable
- Application mobile (React Native)
- Scanner de codes-barres
- Gestion des fournisseurs
- Commandes en ligne
- Programme de fidélité

---

Fin de la documentation architecture. ✨
