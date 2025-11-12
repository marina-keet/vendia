# 📊 Schéma de la Base de Données - Version 2.0.0

## Vue d'ensemble

L'application utilise **SQLite3** comme système de gestion de base de données.

**Fichier de la base :** `database/commerce.db`

---

## 📋 Tables et Structure

### 1. 👤 **users** - Utilisateurs et authentification

Gère les comptes utilisateurs avec leurs rôles et permissions.

| Colonne | Type | Description |
|---------|------|-------------|
| **id** | INTEGER (PK) | Identifiant unique auto-incrémenté |
| **username** | TEXT (UNIQUE) | Nom d'utilisateur pour la connexion |
| **password** | TEXT | Mot de passe haché (SHA-256) |
| **full_name** | TEXT | Nom complet de l'utilisateur |
| **email** | TEXT | Adresse email (optionnel) |
| **role** | TEXT | Rôle : `admin`, `manager`, `cashier` |
| **phone** | TEXT | Numéro de téléphone (optionnel) |
| **is_active** | INTEGER | 1 = actif, 0 = désactivé |
| **created_at** | DATETIME | Date de création du compte |
| **last_login** | DATETIME | Dernière connexion |
| **created_by** | INTEGER (FK) | ID de l'utilisateur créateur |

**Index :** username (UNIQUE)

**Rôles disponibles :**
- `admin` : Accès complet
- `manager` : Gestion sans modification utilisateurs/paramètres
- `cashier` : Point de vente et consultation

**Compte par défaut :**
```sql
username: 'admin'
password: 'admin123' (haché)
role: 'admin'
```

---

### 2. 📦 **products** - Produits

Catalogue complet des produits avec gestion du stock.

| Colonne | Type | Description |
|---------|------|-------------|
| **id** | INTEGER (PK) | Identifiant unique auto-incrémenté |
| **name** | TEXT | Nom du produit |
| **description** | TEXT | Description détaillée (optionnel) |
| **price** | REAL | Prix unitaire en FC |
| **stock** | INTEGER | Quantité disponible en stock |
| **category** | TEXT | Catégorie du produit |
| **barcode** | TEXT | Code-barres pour scan (optionnel) |
| **image** | TEXT | URL/chemin de l'image (optionnel) |
| **created_at** | DATETIME | Date d'ajout du produit |
| **updated_at** | DATETIME | Dernière modification |

**Index :** barcode (pour recherche rapide)

**Catégories courantes :**
- Alimentation
- Boissons
- Hygiène
- Électronique
- Autres

---

### 3. 💰 **sales** - Ventes

Enregistrement des transactions de vente.

| Colonne | Type | Description |
|---------|------|-------------|
| **id** | INTEGER (PK) | Identifiant unique auto-incrémenté |
| **total_amount** | REAL | Montant total avant remise |
| **discount** | REAL | Montant de la remise appliquée |
| **final_amount** | REAL | Montant final après remise |
| **payment_method** | TEXT | Mode de paiement |
| **notes** | TEXT | Notes/commentaires (optionnel) |
| **user_id** | INTEGER (FK) | ID de l'utilisateur vendeur (nullable) |
| **customer_id** | INTEGER (FK) | ID du client (nullable) |
| **created_at** | DATETIME | Date et heure de la vente |

**Relations :**
- `user_id` → `users.id` (vendeur)
- `customer_id` → `customers.id` (client)

**Modes de paiement :**
- `cash` : Espèces
- `card` : Carte bancaire
- `mobile_money` : Mobile Money (Orange, MTN, etc.)
- `other` : Autre méthode

---

### 4. 🛒 **sale_items** - Articles vendus

Détail des produits dans chaque vente (liaison many-to-many).

| Colonne | Type | Description |
|---------|------|-------------|
| **id** | INTEGER (PK) | Identifiant unique auto-incrémenté |
| **sale_id** | INTEGER (FK) | ID de la vente parente |
| **product_id** | INTEGER (FK) | ID du produit vendu |
| **product_name** | TEXT | Nom du produit (snapshot) |
| **quantity** | INTEGER | Quantité vendue |
| **unit_price** | REAL | Prix unitaire au moment de la vente |
| **subtotal** | REAL | Total de la ligne (quantity × unit_price) |

**Relations :**
- `sale_id` → `sales.id`
- `product_id` → `products.id`

**Note :** Le `product_name` et `unit_price` sont stockés pour historique (prix peut changer).

---

### 5. 💳 **payments** - Paiements (détails)

Détails des paiements pour chaque vente.

| Colonne | Type | Description |
|---------|------|-------------|
| **id** | INTEGER (PK) | Identifiant unique auto-incrémenté |
| **sale_id** | INTEGER (FK) | ID de la vente associée |
| **amount** | REAL | Montant payé |
| **method** | TEXT | Méthode de paiement |
| **reference** | TEXT | Référence de transaction (optionnel) |
| **created_at** | DATETIME | Date du paiement |

**Relation :**
- `sale_id` → `sales.id`

---

### 6. 👥 **customers** - Clients

Base de données clients avec programme de fidélité.

| Colonne | Type | Description |
|---------|------|-------------|
| **id** | INTEGER (PK) | Identifiant unique auto-incrémenté |
| **name** | TEXT | Nom complet du client |
| **email** | TEXT | Adresse email (optionnel) |
| **phone** | TEXT | Numéro de téléphone |
| **address** | TEXT | Adresse postale (optionnel) |
| **loyalty_points** | INTEGER | Points de fidélité accumulés |
| **total_purchases** | REAL | Montant total des achats |
| **visit_count** | INTEGER | Nombre de visites/achats |
| **notes** | TEXT | Notes/commentaires (optionnel) |
| **created_at** | DATETIME | Date d'enregistrement |
| **updated_at** | DATETIME | Dernière modification |

**Programme de fidélité :**
- Les points sont calculés selon la configuration dans `settings`
- Exemple : 1 point pour chaque 100 FC dépensés

---

### 7. 🔐 **sessions** - Sessions d'authentification

Gestion des sessions utilisateurs actives.

| Colonne | Type | Description |
|---------|------|-------------|
| **id** | TEXT (PK) | Token de session (hash SHA-256) |
| **user_id** | INTEGER (FK) | ID de l'utilisateur connecté |
| **created_at** | DATETIME | Date de création de la session |
| **expires_at** | DATETIME | Date d'expiration (7 jours par défaut) |

**Relation :**
- `user_id` → `users.id`

**Nettoyage automatique :** Les sessions expirées sont supprimées automatiquement.

---

### 8. ⚙️ **settings** - Paramètres de configuration

Configuration globale de l'application (clé-valeur).

| Colonne | Type | Description |
|---------|------|-------------|
| **key** | TEXT (PK) | Clé du paramètre (unique) |
| **value** | TEXT | Valeur du paramètre |
| **category** | TEXT | Catégorie (business, general, etc.) |
| **description** | TEXT | Description du paramètre |
| **updated_at** | DATETIME | Dernière modification |

**Catégories :**
- `business` : Informations de l'entreprise
- `general` : Paramètres généraux (devise, TVA)
- `inventory` : Gestion du stock
- `receipt` : Configuration des reçus
- `loyalty` : Programme de fidélité

**Paramètres par défaut :**
```sql
business_name, business_address, business_phone, business_email
currency, tax_rate, timezone
low_stock_threshold, critical_stock_threshold
receipt_footer, receipt_paper_size
loyalty_enabled, loyalty_points_per_currency
```

---

## 🔗 Relations entre les Tables

```
users (1) ──────→ (N) sales          [Vendeur]
customers (1) ───→ (N) sales          [Client]
sales (1) ───────→ (N) sale_items     [Articles vendus]
products (1) ────→ (N) sale_items     [Produit vendu]
sales (1) ───────→ (N) payments       [Paiements]
users (1) ───────→ (N) sessions       [Sessions actives]
```

### Diagramme relationnel

```
┌─────────────┐
│   users     │
│  (vendeurs) │
└──────┬──────┘
       │
       │ user_id
       ↓
┌─────────────┐      ┌──────────────┐
│  customers  │      │   products   │
│  (clients)  │      │  (catalogue) │
└──────┬──────┘      └───────┬──────┘
       │                     │
       │ customer_id         │ product_id
       │                     │
       ↓                     ↓
┌─────────────┐      ┌──────────────┐
│    sales    │─────→│  sale_items  │
│  (ventes)   │      │  (articles)  │
└──────┬──────┘      └──────────────┘
       │
       │ sale_id
       ↓
┌─────────────┐
│  payments   │
│ (paiements) │
└─────────────┘

┌─────────────┐      ┌──────────────┐
│   users     │─────→│   sessions   │
└─────────────┘      └──────────────┘

┌─────────────┐
│  settings   │
│   (config)  │
└─────────────┘
```

---

## 📊 Exemples de Requêtes

### Créer une vente complète

```sql
-- 1. Insérer la vente
INSERT INTO sales (total_amount, discount, final_amount, payment_method, user_id, customer_id)
VALUES (5000, 0, 5000, 'cash', 1, 3);

-- 2. Récupérer l'ID de la vente
-- lastID = 42

-- 3. Insérer les articles
INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, subtotal)
VALUES 
  (42, 1, 'Produit A', 2, 1500, 3000),
  (42, 5, 'Produit B', 1, 2000, 2000);

-- 4. Mettre à jour le stock
UPDATE products SET stock = stock - 2 WHERE id = 1;
UPDATE products SET stock = stock - 1 WHERE id = 5;

-- 5. Enregistrer le paiement
INSERT INTO payments (sale_id, amount, method)
VALUES (42, 5000, 'cash');
```

### Récupérer l'historique d'un client

```sql
SELECT 
  s.id,
  s.created_at,
  s.final_amount,
  s.payment_method,
  u.full_name as vendeur,
  GROUP_CONCAT(si.product_name, ', ') as produits
FROM sales s
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN sale_items si ON s.id = si.sale_id
WHERE s.customer_id = 3
GROUP BY s.id
ORDER BY s.created_at DESC;
```

### Top 10 des produits les plus vendus

```sql
SELECT 
  p.name,
  SUM(si.quantity) as total_vendu,
  SUM(si.subtotal) as revenu_total
FROM sale_items si
JOIN products p ON si.product_id = p.id
GROUP BY si.product_id
ORDER BY total_vendu DESC
LIMIT 10;
```

### Statistiques par vendeur

```sql
SELECT 
  u.full_name,
  u.role,
  COUNT(s.id) as nb_ventes,
  SUM(s.final_amount) as total_ventes
FROM users u
LEFT JOIN sales s ON u.id = s.user_id
WHERE u.is_active = 1
GROUP BY u.id
ORDER BY total_ventes DESC;
```

---

## 🔒 Sécurité et Intégrité

### Contraintes implémentées

1. **Clés primaires** sur toutes les tables
2. **Clés étrangères** pour relations
3. **UNIQUE** sur `users.username`
4. **Transactions** pour opérations critiques
5. **Hachage** des mots de passe (SHA-256)
6. **Timestamps** automatiques (CURRENT_TIMESTAMP)

### Gestion des transactions

Toutes les opérations de vente utilisent des transactions :

```javascript
db.serialize(() => {
  db.run('BEGIN TRANSACTION');
  
  // Opérations multiples...
  
  if (error) {
    db.run('ROLLBACK');
  } else {
    db.run('COMMIT');
  }
});
```

---

## 📈 Performances

### Index recommandés

```sql
-- Recherche de produits par code-barres
CREATE INDEX idx_products_barcode ON products(barcode);

-- Recherche de ventes par date
CREATE INDEX idx_sales_date ON sales(created_at);

-- Recherche de sessions par utilisateur
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- Recherche de clients par téléphone
CREATE INDEX idx_customers_phone ON customers(phone);
```

### Optimisations implémentées

- **Snapshot des données** : Prix et nom de produit dans `sale_items`
- **Calcul pré-stocké** : `subtotal`, `final_amount`
- **Dénormalisation** : `total_purchases` et `visit_count` dans `customers`

---

## 🔄 Migrations et Maintenance

### Scripts disponibles

```bash
# Initialiser la base de données
node database/init.js

# Étendre le schéma (auth, clients, etc.)
node database/schema-extended.js

# Ajouter des données de démo
node demo.js

# Maintenance (backup, nettoyage)
node maintenance.js
```

### Backup recommandé

```bash
# Copie manuelle
cp database/commerce.db database/backup/commerce_$(date +%Y%m%d).db

# Avec compression
tar -czf commerce_$(date +%Y%m%d).tar.gz database/commerce.db
```

---

## 📝 Notes Importantes

### Différences avec MongoDB

Vous avez mentionné MongoDB pour les clients. Actuellement, l'application utilise **SQLite** pour toutes les tables, y compris les clients.

**Avantages de SQLite :**
- ✅ Pas de serveur externe requis
- ✅ Fichier unique portable
- ✅ Relations et intégrité référentielle
- ✅ Transactions ACID
- ✅ Parfait pour PME/commerce local

**Si vous souhaitez MongoDB pour les clients :**
- Nécessite une architecture hybride (SQLite + MongoDB)
- Plus complexe à maintenir
- Recommandé uniquement si >100k clients

### Évolution future

Pour passer à une base plus robuste (PostgreSQL, MySQL) :
1. Export des données : `sqlite3 commerce.db .dump > backup.sql`
2. Conversion du schéma
3. Import dans la nouvelle base
4. Mise à jour des connexions dans le code

---

**Version du schéma :** 2.0.0  
**Date :** 8 Novembre 2024  
**Type de base :** SQLite3  
**Fichier :** `database/commerce.db`
