# Guide d'Authentification et Multi-Utilisateurs

## 🔐 Authentification

### Connexion
L'application nécessite maintenant une authentification pour accéder aux fonctionnalités.

**Compte administrateur par défaut :**
- **Utilisateur :** `admin`
- **Mot de passe :** `admin123`

**URL de connexion :** http://localhost:3000/login

### Rôles et Permissions

L'application supporte 3 rôles avec des permissions différentes :

#### 👑 Administrateur (admin)
- **Accès complet** à toutes les fonctionnalités
- Gestion des utilisateurs (créer, modifier, supprimer)
- Gestion des paramètres de l'application
- Toutes les fonctionnalités des rôles inférieurs

#### 📊 Gérant (manager)
- Gestion des produits et du stock
- Gestion des clients
- Consultation de toutes les ventes et statistiques
- Visualisation des utilisateurs (sans modification)
- Toutes les fonctionnalités des caissiers

#### 💰 Caissier (cashier)
- Point de vente (POS)
- Enregistrement des ventes
- Consultation du tableau de bord
- Consultation de ses propres statistiques

---

### 📋 Matrice Détaillée des Permissions

| Fonctionnalité | Admin | Manager | Cashier |
|----------------|-------|---------|---------|
| **Authentification** |
| Se connecter / Se déconnecter | ✅ | ✅ | ✅ |
| Voir son profil | ✅ | ✅ | ✅ |
| Modifier son mot de passe | ✅ | ✅ | ✅ |
| **Dashboard** |
| Voir statistiques générales | ✅ | ✅ | ✅ |
| Voir graphiques des ventes | ✅ | ✅ | ✅ |
| Voir alertes de stock | ✅ | ✅ | ✅ |
| **Produits** |
| Consulter la liste | ✅ | ✅ | ✅ |
| Créer un produit | ✅ | ✅ | ❌ |
| Modifier un produit | ✅ | ✅ | ❌ |
| Supprimer un produit | ✅ | ✅ | ❌ |
| Ajuster le stock | ✅ | ✅ | ❌ |
| **Point de Vente (POS)** |
| Accéder à la caisse | ✅ | ✅ | ✅ |
| Enregistrer une vente | ✅ | ✅ | ✅ |
| Appliquer une remise | ✅ | ✅ | ⚠️ Limitée |
| Lier un client | ✅ | ✅ | ✅ |
| Annuler une vente | ✅ | ✅ | ❌ |
| **Ventes** |
| Voir toutes les ventes | ✅ | ✅ | ⚠️ Ses ventes |
| Voir détails d'une vente | ✅ | ✅ | ⚠️ Ses ventes |
| Filtrer les ventes | ✅ | ✅ | ⚠️ Ses ventes |
| Réimprimer un reçu | ✅ | ✅ | ✅ |
| Modifier une vente | ✅ | ✅ | ❌ |
| Supprimer une vente | ✅ | ❌ | ❌ |
| **Clients** |
| Voir la liste des clients | ✅ | ✅ | ✅ |
| Voir détails d'un client | ✅ | ✅ | ✅ |
| Créer un client | ✅ | ✅ | ✅ |
| Modifier un client | ✅ | ✅ | ❌ |
| Supprimer un client | ✅ | ✅ | ❌ |
| Voir historique d'achat | ✅ | ✅ | ✅ |
| Gérer points de fidélité | ✅ | ✅ | ❌ |
| **Utilisateurs** |
| Voir la liste | ✅ | ⚠️ Lecture seule | ❌ |
| Voir détails | ✅ | ⚠️ Lecture seule | ❌ |
| Créer un utilisateur | ✅ | ❌ | ❌ |
| Modifier un utilisateur | ✅ | ❌ | ❌ |
| Supprimer/Désactiver | ✅ | ❌ | ❌ |
| Changer rôle | ✅ | ❌ | ❌ |
| Réinitialiser mot de passe | ✅ | ❌ | ❌ |
| **Rapports** |
| Voir rapports généraux | ✅ | ✅ | ⚠️ Limités |
| Voir tous les graphiques | ✅ | ✅ | ⚠️ Basiques |
| Exporter en CSV | ✅ | ✅ | ❌ |
| Rapports par utilisateur | ✅ | ✅ | ⚠️ Soi-même |
| Rapports par client | ✅ | ✅ | ❌ |
| **Paramètres** |
| Accéder aux paramètres | ✅ | ⚠️ Lecture seule | ❌ |
| Modifier entreprise | ✅ | ❌ | ❌ |
| Modifier devise/TVA | ✅ | ❌ | ❌ |
| Modifier seuils stock | ✅ | ❌ | ❌ |
| Personnaliser reçus | ✅ | ❌ | ❌ |
| Configurer fidélité | ✅ | ❌ | ❌ |

**Légende :**
- ✅ Accès complet
- ⚠️ Accès partiel ou limité
- ❌ Pas d'accès

### 🔐 Restrictions Spécifiques par Rôle

#### Caissier (cashier) - Restrictions
- ❌ Ne peut pas modifier les prix des produits
- ❌ Ne peut pas voir les ventes des autres utilisateurs
- ❌ Ne peut pas supprimer de données
- ❌ Remises limitées à 10% maximum (configurable)
- ❌ Ne peut pas accéder aux paramètres système
- ❌ Ne peut pas créer/modifier des utilisateurs

#### Gérant (manager) - Restrictions  
- ❌ Ne peut pas créer de nouveaux utilisateurs
- ❌ Ne peut pas modifier les rôles
- ❌ Ne peut pas changer les paramètres système
- ❌ Ne peut pas supprimer de ventes
- ✅ Peut tout voir mais modification limitée

#### Administrateur (admin) - Privilèges
- ✅ Accès complet sans restriction
- ✅ Peut tout créer, modifier, supprimer
- ✅ Gère les utilisateurs et leurs rôles
- ✅ Configure tous les paramètres système
- ✅ Accès à tous les logs et audits

### 🛡️ Mécanismes de Sécurité Implémentés

#### 1. Authentification
```javascript
// Middleware requireAuth
// Vérifie la présence et validité du token de session
// Attache req.user avec les infos utilisateur
```

#### 2. Autorisation par Rôle
```javascript
// Middleware requireRole('admin', 'manager')
// Vérifie que l'utilisateur a l'un des rôles autorisés
// Retourne 403 Forbidden si permissions insuffisantes
```

#### 3. Validation des Sessions
- Expiration automatique après 7 jours
- Nettoyage automatique des sessions expirées
- Un utilisateur = une session active (nouvelle connexion invalide l'ancienne)

#### 4. Protection des Routes API
```javascript
// Exemple de protection
router.delete('/customers/:id', 
  requireAuth,                    // Doit être connecté
  requireRole('admin', 'manager'), // Doit être admin ou manager
  async (req, res) => { ... }
);
```

#### 5. Traçabilité
- Chaque vente enregistre `user_id` (qui a vendu)
- Chaque création d'utilisateur enregistre `created_by`
- Timestamps sur toutes les opérations (`created_at`, `updated_at`)

### 🔒 Bonnes Pratiques de Sécurité

#### Pour les Administrateurs
1. **Changez le mot de passe par défaut** immédiatement
2. Utilisez des **mots de passe forts** (min. 12 caractères)
3. Ne partagez **jamais** les identifiants admin
4. Créez des comptes spécifiques pour chaque employé
5. Désactivez les comptes des employés qui quittent
6. Vérifiez régulièrement les **sessions actives**
7. Sauvegardez la base de données régulièrement

#### Pour les Gérants
1. Ne laissez pas votre session ouverte sans surveillance
2. Déconnectez-vous en fin de journée
3. Signalez toute activité suspecte à l'admin

#### Pour les Caissiers
1. Ne partagez pas votre compte
2. Déconnectez-vous entre chaque équipe
3. Vérifiez que c'est bien votre nom dans le menu

### 📊 Audit et Surveillance

#### Informations Traçables
- **Qui** : user_id sur chaque vente
- **Quand** : created_at sur toutes les tables
- **Quoi** : Détails complets des opérations
- **Combien** : Montants et quantités

#### Requêtes d'Audit Utiles
```sql
-- Ventes par utilisateur aujourd'hui
SELECT u.full_name, COUNT(*) as nb_ventes, SUM(s.final_amount) as total
FROM sales s
JOIN users u ON s.user_id = u.id
WHERE DATE(s.created_at) = DATE('now')
GROUP BY u.id;

-- Sessions actives
SELECT u.username, u.role, s.created_at, s.expires_at
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.expires_at > datetime('now');

-- Dernières modifications de produits
SELECT name, updated_at
FROM products
ORDER BY updated_at DESC
LIMIT 10;
```

## 📱 Nouvelles Pages

### 1. Page de Connexion (`/login`)
- Formulaire d'authentification sécurisé
- Validation des identifiants
- Création de session avec expiration (7 jours)
- Redirection automatique si déjà connecté

### 2. Gestion des Clients (`/customers`)
**Fonctionnalités :**
- ➕ Création de nouveaux clients
- 📝 Modification des informations clients
- 🗑️ Suppression (admin/manager uniquement)
- 🔍 Recherche par nom, téléphone, email
- 📊 Visualisation de l'historique d'achat
- ⭐ Système de points de fidélité
- 📈 Statistiques par client (total achats, nombre de ventes)

**Champs client :**
- Nom complet *
- Téléphone *
- Email (optionnel)
- Adresse (optionnel)
- Points de fidélité (calculé automatiquement)

### 3. Gestion des Utilisateurs (`/users`)
**Fonctionnalités (Admin/Manager) :**
- ➕ Création de nouveaux utilisateurs
- 📝 Modification des informations
- 🔑 Changement de mot de passe
- 🚫 Désactivation d'utilisateurs
- 👥 Attribution des rôles
- 📊 Statistiques par utilisateur

**Champs utilisateur :**
- Nom d'utilisateur * (unique)
- Nom complet *
- Email (optionnel)
- Rôle * (admin/manager/cashier)
- Mot de passe * (min. 6 caractères)

### 4. Historique des Ventes (`/sales`)
**Fonctionnalités :**
- 📋 Liste complète des ventes
- 🔍 Filtres avancés :
  - Période (date début/fin)
  - Méthode de paiement
- 👁️ Vue détaillée de chaque vente :
  - Articles vendus
  - Client lié (si applicable)
  - Vendeur qui a traité la vente
  - Détail des paiements
- 🖨️ Impression des reçus
- 📄 Pagination

### 5. Paramètres (`/settings`)
**Onglets de configuration (Admin uniquement) :**

#### 🏢 Entreprise
- Nom de l'entreprise
- Adresse complète
- Téléphone
- Email
- Numéro d'identification fiscale

#### ⚙️ Général
- Devise (FCFA, EUR, USD, GBP)
- Position de la devise
- Taux de TVA (%)
- TVA incluse ou non
- Fuseau horaire

#### 📦 Inventaire
- Seuil d'alerte stock bas
- Seuil stock critique
- Alertes automatiques de réapprovisionnement
- Autorisation des ventes en rupture de stock

#### 🧾 Reçus
- Affichage du logo
- Affichage du détail de la TVA
- Message de pied de page personnalisable
- Taille du papier (80mm, 58mm, A4)
- Impression automatique

#### ⭐ Fidélité
- Activation du programme
- Points par unité monétaire dépensée
- Valeur monétaire d'un point
- Points minimum pour remise

## 🔄 Améliorations du Point de Vente

Le Point de Vente (POS) a été amélioré pour inclure :

### 🤝 Liaison avec les Clients
- **Sélection de client** dans le panier
- Les ventes sont automatiquement liées au client sélectionné
- Permet le suivi des achats par client
- Calcul automatique des points de fidélité (si activé)

### 👤 Traçabilité des Ventes
- Chaque vente enregistre l'utilisateur qui l'a effectuée
- Permet des statistiques par vendeur
- Audit complet des opérations

## 🔒 Sécurité

### Authentification
- Hachage SHA-256 des mots de passe
- Sessions sécurisées avec identifiants aléatoires
- Expiration automatique des sessions (7 jours)
- Nettoyage automatique des sessions expirées

### Protection des Routes
- Middleware d'authentification sur toutes les routes sensibles
- Vérification des rôles pour les opérations critiques
- Code HTTP 401 pour accès non authentifié
- Code HTTP 403 pour permissions insuffisantes

### Headers HTTP
Toutes les requêtes API authentifiées doivent inclure :
```
X-Session-Id: <sessionId-obtenu-au-login>
```

## 💾 Base de Données

### Nouvelles Tables

#### `users` - Utilisateurs
```sql
- id (PK)
- username (UNIQUE)
- password (hashed)
- full_name
- email
- role (admin/manager/cashier)
- phone
- is_active
- created_at
- last_login
```

#### `customers` - Clients
```sql
- id (PK)
- name
- email
- phone
- address
- loyalty_points
- total_purchases
- visit_count
- notes
- created_at
- updated_at
```

#### `sessions` - Sessions d'authentification
```sql
- id (PK, session token)
- user_id (FK -> users)
- created_at
- expires_at
```

#### `settings` - Configuration
```sql
- key (PK)
- value
- category
- description
- updated_at
```

### Tables Modifiées

#### `sales` - Ajout de colonnes
```sql
- customer_id (FK -> customers, nullable)
- user_id (FK -> users, nullable)
```

## 📊 API REST Complète

### Authentification
```
POST   /api/auth/login          - Connexion
POST   /api/auth/logout         - Déconnexion
GET    /api/auth/check          - Vérifier session
```

### Clients
```
GET    /api/customers           - Liste des clients
GET    /api/customers/:id       - Détails + historique
POST   /api/customers           - Créer un client
PUT    /api/customers/:id       - Modifier
DELETE /api/customers/:id       - Supprimer (admin/manager)
GET    /api/customers/:id/stats - Statistiques client
```

### Utilisateurs
```
GET    /api/users               - Liste (admin/manager)
GET    /api/users/:id           - Détails
POST   /api/users               - Créer (admin)
PUT    /api/users/:id           - Modifier
DELETE /api/users/:id           - Désactiver (admin)
PUT    /api/users/:id/password  - Changer mot de passe
GET    /api/users/:id/stats     - Statistiques utilisateur
```

### Paramètres
```
GET    /api/settings            - Liste
GET    /api/settings/:key       - Paramètre spécifique
PUT    /api/settings/:key       - Modifier (admin)
POST   /api/settings/bulk-update - Mise à jour multiple (admin)
```

### Ventes (modifié)
```
POST   /api/sales               - Créer vente (avec customerId et userId)
```

## 🎨 Interface Utilisateur

### Menu de Navigation
Le header affiche maintenant :
- **Nom de l'utilisateur** connecté
- **Menu déroulant** avec :
  - Mon profil
  - Tableau de bord
  - Point de vente
  - Produits
  - Rapports
  - Historique des ventes
  - Clients
  - **Utilisateurs** (admin/manager uniquement)
  - **Paramètres** (admin/manager uniquement)
  - Déconnexion

### Indicateurs Visuels
- 🟢 Badge du rôle utilisateur
- 🔴 Indicateurs d'accès restreint
- ⚠️ Alertes de permissions

## 🧪 Tests

Un script de test complet est fourni : `test-auth.js`

**Lancer les tests :**
```bash
node test-auth.js
```

**Tests couverts :**
1. Login avec admin par défaut
2. Vérification de session valide
3. Liste des clients
4. Liste des utilisateurs
5. Récupération des paramètres
6. Création de vente avec client
7. Refus d'accès sans authentification
8. Logout
9. Invalidation de session après logout

## 🚀 Mise en Route Rapide

### Premier Démarrage
1. Lancer le serveur : `npm start`
2. Ouvrir http://localhost:3000
3. Se connecter avec `admin` / `admin123`
4. **Important :** Changer le mot de passe admin immédiatement !

### Configuration Initiale Recommandée
1. **Paramètres > Entreprise** : Configurer les informations de l'entreprise
2. **Utilisateurs** : Créer les comptes pour vos employés
3. **Clients** : Importer/créer votre base clients
4. **Paramètres > Fidélité** : Configurer le programme de fidélité si souhaité
5. **Paramètres > Reçus** : Personnaliser les reçus

### Workflow Quotidien
1. **Caissier** se connecte
2. Utilise le **Point de Vente** pour enregistrer les ventes
3. Sélectionne le client si connu
4. Valide la vente
5. Imprime le reçu
6. **Gérant** consulte les **Rapports** et **Statistiques**
7. **Admin** gère les **Utilisateurs** et **Paramètres**

## 🔧 Dépannage

### Impossible de se connecter
- Vérifier que la base de données existe : `database/commerce.db`
- Réinitialiser le mot de passe admin si oublié (voir script de maintenance)

### Session expirée
- Les sessions expirent après 7 jours
- Se reconnecter simplement

### Erreur "Non autorisé"
- Vérifier que votre rôle a les permissions nécessaires
- Contacter un administrateur pour ajustement

### Problèmes de permissions
- Seuls admin/manager peuvent gérer les utilisateurs
- Seul admin peut modifier les paramètres
- Vérifier les rôles dans **Utilisateurs**

## 📚 Ressources

- **Documentation principale :** `README.md`
- **Guide d'utilisation :** `GUIDE_UTILISATEUR.md`
- **Architecture :** `ARCHITECTURE.md`
- **Tests :** `TESTS.md`
- **Feuille de route :** `ROADMAP.md`

## 🆕 Prochaines Améliorations Suggérées

1. **Authentification 2FA** (authentification à deux facteurs)
2. **Historique d'activité** par utilisateur
3. **Notifications** par email/SMS
4. **Export Excel** des rapports
5. **Tableau de bord personnalisé** par rôle
6. **API REST complète** avec documentation Swagger
7. **Application mobile** pour les caissiers

---

**Version :** 2.0.0 avec authentification multi-utilisateurs  
**Date :** Novembre 2024
