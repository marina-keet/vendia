# 🔐 Mise à Jour des Permissions - Système Sécurisé

## 📋 Vue d'ensemble

Suite aux exigences de sécurité, le système a été reconfiguré avec des permissions strictes et une séparation claire des rôles.

## 🚫 Changements Majeurs

### 1. Inscription Publique DÉSACTIVÉE

**Avant** : Tout le monde pouvait créer un compte via `/register`  
**Maintenant** : Page d'inscription désactivée avec message explicatif

**Raison** : Sécurité - Seuls les admin/manager peuvent créer des comptes

```
┌─────────────────────────────────────────┐
│  ❌ INSCRIPTION PUBLIQUE DÉSACTIVÉE     │
│                                          │
│  Les comptes sont créés uniquement      │
│  par les administrateurs via la page    │
│  "Utilisateurs"                          │
└─────────────────────────────────────────┘
```

### 2. Création de Comptes Réservée

**Qui peut créer des comptes ?**
- ✅ **Admin** : Peut créer n'importe quel rôle (admin, manager, cashier)
- ✅ **Manager** : Peut créer des caissiers uniquement
- ❌ **Cashier** : Ne peut pas créer de comptes

**Comment ?**
1. Se connecter en tant qu'admin ou manager
2. Aller dans la page "Utilisateurs"
3. Cliquer sur "Ajouter un utilisateur"
4. Remplir le formulaire (username, password, email, nom, rôle)
5. Le nouveau compte est créé

## 👥 Rôles et Permissions Détaillées

### 🔴 ADMIN (Contrôle Total)

L'admin a **TOUS LES DROITS** sur le système :

#### Utilisateurs
- ✅ Créer des utilisateurs (tous rôles)
- ✅ Modifier les utilisateurs
- ✅ Désactiver les utilisateurs
- ✅ **SUPPRIMER définitivement les utilisateurs**
- ✅ Changer les rôles
- ✅ Réinitialiser les mots de passe

#### Produits
- ✅ Voir tous les produits
- ✅ Créer des produits
- ✅ Modifier des produits
- ✅ **SUPPRIMER des produits**
- ✅ Gérer les stocks
- ✅ Gérer les catégories

#### Clients
- ✅ Voir tous les clients
- ✅ Créer des clients
- ✅ Modifier des clients
- ✅ **SUPPRIMER des clients**
- ✅ Gérer les points de fidélité

#### Ventes & Caisse
- ✅ Accès complet au POS
- ✅ Enregistrer des ventes
- ✅ Voir toutes les ventes
- ✅ Voir les détails des ventes
- ✅ Annuler des ventes

#### Rapports & Paramètres
- ✅ Voir tous les rapports
- ✅ Exporter les données
- ✅ Modifier les paramètres système
- ✅ Gérer la configuration

**En résumé** : L'admin peut **TOUT FAIRE** incluant les suppressions définitives.

---

### 🔵 MANAGER (Gestion Opérationnelle)

Le manager gère les opérations quotidiennes **SANS pouvoir supprimer** :

#### Utilisateurs
- ✅ Voir tous les utilisateurs
- ✅ Créer des caissiers
- ❌ Créer des managers ou admins
- ⚠️ Modifier partiellement les utilisateurs
- ❌ Supprimer des utilisateurs
- ❌ Changer les rôles admin/manager

#### Produits
- ✅ Voir tous les produits
- ✅ Créer des produits
- ✅ Modifier des produits
- ❌ **SUPPRIMER des produits** (réservé admin)
- ✅ Gérer les stocks
- ✅ Gérer les catégories

#### Clients
- ✅ Voir tous les clients
- ✅ Créer des clients
- ✅ Modifier des clients
- ❌ **SUPPRIMER des clients** (réservé admin)
- ✅ Gérer les points de fidélité

#### Ventes & Caisse
- ✅ Accès complet au POS
- ✅ Enregistrer des ventes
- ✅ Voir toutes les ventes
- ✅ Voir les détails des ventes
- ⚠️ Annuler des ventes (avec restrictions)

#### Rapports & Paramètres
- ✅ Voir tous les rapports
- ✅ Exporter les données
- ❌ Modifier les paramètres système (lecture seule)
- ❌ Gérer la configuration

**En résumé** : Le manager gère tout **SAUF les suppressions et paramètres système**.

---

### 🟢 CASHIER (Point de Vente Uniquement)

Le caissier a un accès **TRÈS LIMITÉ** :

#### Utilisateurs
- ❌ Ne peut pas voir les autres utilisateurs
- ❌ Ne peut pas créer d'utilisateurs
- ⚠️ Peut modifier son propre profil uniquement
- ❌ Aucun accès à la gestion des utilisateurs

#### Produits
- ✅ Voir les produits (lecture seule)
- ❌ Créer des produits
- ❌ Modifier des produits
- ❌ Supprimer des produits
- ⚠️ Peut voir les stocks (pas modifier)

#### Clients
- ✅ Voir les clients
- ⚠️ Créer un client lors d'une vente
- ❌ Modifier des clients existants
- ❌ Supprimer des clients

#### Ventes & Caisse
- ✅ **Accès au POS (principale fonction)**
- ✅ Enregistrer des ventes
- ✅ Voir ses propres ventes uniquement
- ✅ Imprimer des reçus
- ❌ Voir les ventes des autres caissiers
- ❌ Annuler des ventes

#### Rapports & Paramètres
- ⚠️ Voir ses propres statistiques uniquement
- ❌ Pas d'accès aux rapports globaux
- ❌ Pas d'accès aux paramètres
- ❌ Pas d'export de données

**En résumé** : Le caissier **utilise uniquement le POS** pour enregistrer des ventes.

---

## 🗑️ Suppressions - Règles Strictes

### Supprimer un Utilisateur

**Permissions** : Admin seulement

**Processus** :
1. Vérification : L'utilisateur a-t-il des ventes ?
   - ✅ **Aucune vente** : Suppression autorisée
   - ❌ **A des ventes** : Suppression bloquée → Désactivation suggérée

2. Options :
   - **DELETE /api/users/:id** : Désactive l'utilisateur (is_active = 0)
   - **DELETE /api/users/:id/permanent** : Suppression définitive (si 0 ventes)

**Exemple** :
```
Utilisateur "paul" créé mais jamais utilisé
→ ✅ Peut être supprimé définitivement

Caissier "marie" avec 150 ventes
→ ❌ Ne peut PAS être supprimé
→ ✅ Peut être désactivé (compte reste pour historique)
```

### Supprimer un Produit

**Permissions** : Admin seulement

**Processus** :
1. Vérification : Le produit est-il dans des ventes ?
   - ✅ **Jamais vendu** : Suppression autorisée
   - ❌ **A été vendu** : Suppression bloquée

**Exemple** :
```
Produit "Test123" créé par erreur, 0 ventes
→ ✅ Peut être supprimé

Produit "Coca Cola" vendu 500 fois
→ ❌ Ne peut PAS être supprimé (historique des ventes)
→ ✅ Peut être marqué "indisponible" ou stock à 0
```

### Supprimer un Client

**Permissions** : Admin seulement

**Processus** :
1. Vérification : Le client a-t-il des achats ?
   - ✅ **Aucun achat** : Suppression autorisée
   - ❌ **A des achats** : Suppression bloquée

**Exemple** :
```
Client "John Doe" enregistré mais jamais acheté
→ ✅ Peut être supprimé

Client "Marie Client" avec 50 achats
→ ❌ Ne peut PAS être supprimé (historique)
```

---

## 📊 Matrice des Permissions Complète

| Fonctionnalité | Admin | Manager | Cashier |
|----------------|-------|---------|---------|
| **UTILISATEURS** |
| Voir tous les utilisateurs | ✅ | ✅ | ❌ |
| Créer admin/manager | ✅ | ❌ | ❌ |
| Créer caissier | ✅ | ✅ | ❌ |
| Modifier utilisateur | ✅ | ⚠️ | ⚠️ (soi) |
| Désactiver utilisateur | ✅ | ❌ | ❌ |
| **Supprimer utilisateur** | ✅ | ❌ | ❌ |
| Changer rôle | ✅ | ❌ | ❌ |
| **PRODUITS** |
| Voir produits | ✅ | ✅ | ✅ |
| Créer produit | ✅ | ✅ | ❌ |
| Modifier produit | ✅ | ✅ | ❌ |
| **Supprimer produit** | ✅ | ❌ | ❌ |
| Gérer stock | ✅ | ✅ | ❌ |
| **CLIENTS** |
| Voir clients | ✅ | ✅ | ✅ |
| Créer client | ✅ | ✅ | ⚠️ (POS) |
| Modifier client | ✅ | ✅ | ❌ |
| **Supprimer client** | ✅ | ❌ | ❌ |
| Gérer points fidélité | ✅ | ✅ | ❌ |
| **VENTES** |
| Utiliser POS | ✅ | ✅ | ✅ |
| Voir toutes ventes | ✅ | ✅ | ❌ |
| Voir ses ventes | ✅ | ✅ | ✅ |
| Annuler vente | ✅ | ⚠️ | ❌ |
| **RAPPORTS** |
| Rapports globaux | ✅ | ✅ | ❌ |
| Ses statistiques | ✅ | ✅ | ✅ |
| Exporter données | ✅ | ✅ | ❌ |
| **PARAMÈTRES** |
| Modifier paramètres | ✅ | ❌ | ❌ |
| Voir paramètres | ✅ | ✅ | ❌ |

**Légende** :
- ✅ = Accès complet
- ⚠️ = Accès partiel/conditionnel
- ❌ = Pas d'accès

---

## 🔒 Sécurité Renforcée

### Middlewares Appliqués

Toutes les routes sont maintenant protégées :

```javascript
// Authentification requise
router.get('/products', requireAuth, ...)

// Rôle admin requis
router.delete('/products/:id', requireAuth, requireRole('admin'), ...)

// Rôle admin OU manager
router.post('/products', requireAuth, requireRole('admin', 'manager'), ...)
```

### Vérifications avant Suppression

Avant chaque suppression, le système vérifie :

```javascript
// Exemple pour un produit
db.get('SELECT COUNT(*) as count FROM sale_items WHERE product_id = ?', ...)
if (count > 0) {
  return error: `Impossible de supprimer, utilisé dans ${count} vente(s)`
}
```

### Messages d'Erreur Clairs

Les utilisateurs reçoivent des messages explicites :

```
❌ "Impossible de supprimer ce client car il a 45 vente(s) associée(s)"
❌ "Impossible de supprimer ce produit car il est utilisé dans 120 vente(s)"
❌ "Accès refusé - Rôle admin requis"
✅ "Utilisateur supprimé définitivement"
✅ "Utilisateur désactivé avec succès"
```

---

## 🚀 Workflow de Gestion

### Créer un Nouveau Caissier (Admin/Manager)

1. Se connecter en tant qu'admin ou manager
2. Aller dans "Utilisateurs"
3. Cliquer sur "Ajouter un utilisateur"
4. Remplir :
   - Username : `caissier_marie`
   - Password : `marie2025`
   - Nom : `Marie Dupont`
   - Email : `marie@moncommerce.com`
   - Rôle : `cashier`
5. Sauvegarder
6. Communiquer les identifiants à Marie :
   - Username : `caissier_marie`
   - Password : `marie2025`
   - URL : `http://localhost:3000/login`

### Marie se Connecte

1. Marie va sur `http://localhost:3000/login`
2. Entre `caissier_marie` / `marie2025`
3. Est redirigée vers le POS
4. Peut commencer à enregistrer des ventes

### Licencier un Caissier (Admin)

**Option 1 : Désactivation** (recommandé si a des ventes)
1. Aller dans "Utilisateurs"
2. Cliquer sur "Désactiver" pour le caissier
3. Le compte est désactivé, l'historique reste

**Option 2 : Suppression** (si aucune vente)
1. Vérifier que le caissier n'a aucune vente
2. Cliquer sur "Supprimer définitivement"
3. Le compte est supprimé de la base

### Gérer les Produits (Admin)

1. **Ajouter** : Admin et Manager peuvent ajouter
2. **Modifier** : Admin et Manager peuvent modifier
3. **Supprimer** : 
   - Vérifier si jamais vendu
   - Si oui → Erreur
   - Si non → Suppression OK

---

## 📝 API Endpoints Mis à Jour

### Utilisateurs

```
GET    /api/users              → Liste (admin/manager)
POST   /api/users              → Créer (admin)
PUT    /api/users/:id          → Modifier (admin)
DELETE /api/users/:id          → Désactiver (admin)
DELETE /api/users/:id/permanent → Supprimer (admin, si 0 ventes)
```

### Produits

```
GET    /api/products           → Liste (tous authentifiés)
POST   /api/products           → Créer (admin/manager)
PUT    /api/products/:id       → Modifier (admin/manager)
DELETE /api/products/:id       → Supprimer (admin, si jamais vendu)
```

### Clients

```
GET    /api/customers          → Liste (tous authentifiés)
POST   /api/customers          → Créer (tous authentifiés)
PUT    /api/customers/:id      → Modifier (tous authentifiés)
DELETE /api/customers/:id      → Supprimer (admin, si aucun achat)
```

### Authentification

```
POST   /api/auth/login         → Connexion (public)
POST   /api/auth/register      → ❌ DÉSACTIVÉ
POST   /api/auth/logout        → Déconnexion (authentifié)
GET    /api/auth/check         → Vérifier session (authentifié)
```

---

## ✅ Checklist Sécurité

- [x] Inscription publique désactivée
- [x] Création de comptes réservée admin/manager
- [x] Permissions par rôle appliquées sur toutes les routes
- [x] Suppressions protégées (vérification dépendances)
- [x] Messages d'erreur clairs
- [x] Middlewares d'authentification sur toutes les routes sensibles
- [x] Distinction désactivation vs suppression
- [x] Admin a contrôle total (y compris suppressions)
- [x] Manager ne peut pas supprimer
- [x] Cashier accès POS uniquement

---

## 📚 Documentation Connexe

- `AUTHENTICATION.md` → Guide complet authentification
- `DATABASE_SCHEMA.md` → Structure base de données
- `REGISTRATION.md` → Système d'inscription (désactivé)
- `STATUS.md` → État actuel du système

---

**Version** : 2.2  
**Date** : 8 novembre 2025  
**Mise à jour** : Permissions strictes + Suppressions admin
