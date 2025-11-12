# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [2.0.0] - 2024-11-08

### 🚀 Mise à jour majeure - Authentification et Multi-Utilisateurs

#### ✨ Ajouté

**Système d'authentification**
- Authentification sécurisée avec sessions
- Hachage SHA-256 des mots de passe
- Sessions avec expiration (7 jours)
- Page de connexion dédiée
- Middleware de protection des routes
- Gestion automatique des sessions expirées

**Gestion des utilisateurs**
- 3 rôles : Administrateur, Gérant, Caissier
- Permissions granulaires par rôle
- CRUD complet des utilisateurs
- Changement de mot de passe sécurisé
- Désactivation d'utilisateurs
- Statistiques par utilisateur
- Traçabilité des opérations

**Gestion des clients**
- Base de données clients complète
- CRUD avec recherche avancée
- Historique d'achat par client
- Programme de points de fidélité
- Statistiques clients (achats totaux, nombre de visites)
- Liaison automatique des ventes aux clients

**Historique des ventes avancé**
- Page dédiée avec tous les détails
- Filtres par date, méthode de paiement
- Vue détaillée de chaque vente
- Identification du vendeur
- Client associé (si applicable)
- Réimpression des reçus
- Pagination des résultats

**Paramètres configurables**
- Configuration entreprise (nom, adresse, contact, fiscal)
- Paramètres généraux (devise, TVA, fuseau horaire)
- Gestion du stock (seuils d'alerte, ruptures)
- Personnalisation des reçus (logo, pied de page, taille)
- Configuration du programme de fidélité
- Interface par onglets intuitive
- Mise à jour en masse

**Améliorations du POS**
- Sélection du client dans le panier
- Liaison automatique vente-client-vendeur
- Calcul automatique des points de fidélité
- Traçabilité complète

#### 🔧 Modifié

**Base de données**
- Extension du schéma avec 4 nouvelles tables :
  - `users` : Utilisateurs et authentification
  - `customers` : Base clients
  - `sessions` : Sessions d'authentification
  - `settings` : Configuration clé-valeur
- Ajout de colonnes à `sales` :
  - `user_id` : Lien vers l'utilisateur
  - `customer_id` : Lien vers le client
- Migration non-destructive du schéma existant

**Interface utilisateur**
- Header avec menu utilisateur et déconnexion
- Navigation adaptée au rôle de l'utilisateur
- Indicateurs visuels des permissions
- Fonction `apiRequest()` pour authentification automatique
- Redirection automatique vers login si non authentifié

**API REST**
- Protection de toutes les routes sensibles
- Nouveaux endpoints d'authentification
- Endpoints clients, utilisateurs, paramètres
- Standardisation des réponses JSON
- Codes HTTP appropriés (401, 403)

#### 📝 Documentation

- **AUTHENTICATION.md** : Guide complet d'authentification
- Mise à jour du README avec nouvelles fonctionnalités
- Documentation des nouveaux endpoints API
- Guide de configuration initiale
- Procédures de dépannage

#### 🧪 Tests

- Script de test d'intégration `test-auth.js`
- 9 tests couvrant l'authentification et les nouvelles APIs
- Validation de la sécurité et des permissions

#### 🔒 Sécurité

- Hachage sécurisé des mots de passe (SHA-256)
- Sessions avec tokens aléatoires cryptographiques
- Middleware d'authentification sur routes protégées
- Vérification des rôles pour opérations critiques
- Nettoyage automatique des sessions expirées
- Protection CSRF basique

---

## [1.0.0] - 2024-11-08

### 🎉 Version initiale

#### ✨ Ajouté

**Gestion des produits**
- Système CRUD complet pour les produits
- Gestion du stock en temps réel
- Organisation par catégories
- Support des codes-barres
- Recherche et filtres avancés
- Alertes de stock faible (≤ 5 unités)

**Point de vente (POS)**
- Interface de caisse intuitive et rapide
- Grille de produits cliquable
- Panier dynamique avec ajustement des quantités
- Support du scanner de codes-barres
- Application de remises
- Multiples méthodes de paiement :
  - Espèces
  - Carte bancaire
  - Mobile Money
  - Autre

**Gestion des ventes**
- Enregistrement des ventes avec détails complets
- Mise à jour automatique des stocks
- Historique complet des transactions
- Détails des articles vendus
- Suivi des paiements

**Génération de reçus**
- Reçus PDF professionnels
- Génération automatique après chaque vente
- Téléchargement et impression
- Archivage automatique dans `/receipts`
- Informations complètes :
  - En-tête personnalisable
  - Détails des articles
  - Totaux et remises
  - Méthode de paiement
  - Date et numéro de vente

**Rapports et statistiques**
- Dashboard avec KPIs en temps réel :
  - Ventes du jour
  - Chiffre d'affaires du jour
  - Nombre de produits en stock
  - Produits en stock faible
- Graphiques interactifs (Chart.js) :
  - Évolution des ventes sur 7/30 jours
  - Répartition des paiements
  - Ventes par catégorie
- Top 10 des produits les plus vendus
- Historique des ventes avec filtres
- Export CSV des rapports

**Base de données**
- SQLite3 pour la persistance
- 4 tables principales :
  - `products` : Catalogue produits
  - `sales` : Ventes enregistrées
  - `sale_items` : Détails des articles vendus
  - `payments` : Transactions de paiement
- Transactions atomiques (ACID)
- Index sur code-barres
- Timestamps automatiques

**Interface utilisateur**
- Design moderne avec Tailwind CSS
- Responsive (desktop, tablette, mobile)
- Navigation intuitive
- Icônes Font Awesome
- Messages de confirmation
- Modales pour ajout/modification
- Formulaires validés

**Scripts utilitaires**
- `demo.js` : Génération de données de démonstration
- `maintenance.js` : Scripts de maintenance :
  - `stats` : Afficher les statistiques
  - `backup` : Créer une sauvegarde
  - `clean-receipts` : Nettoyer les anciens reçus
  - `clear-sales` : Supprimer toutes les ventes
  - `reset` : Réinitialiser la base de données

**Documentation**
- README.md : Documentation principale
- QUICKSTART.md : Guide de démarrage rapide
- GUIDE_UTILISATEUR.md : Guide utilisateur complet
- ARCHITECTURE.md : Documentation technique
- TESTS.md : Guide de tests
- ROADMAP.md : Fonctionnalités futures
- CHANGELOG.md : Historique des versions

**Configuration**
- `config.js` : Configuration centralisée
- Variables d'environnement supportées
- Personnalisation des informations du commerce
- Configuration des seuils de stock

#### 🔧 Technique

**Backend**
- Node.js avec Express.js
- Architecture MVC
- Routes API RESTful
- Middleware body-parser
- Gestion d'erreurs robuste
- Validation des données

**Frontend**
- Moteur de templates EJS
- CSS avec Tailwind CDN
- JavaScript vanilla (pas de framework)
- Fetch API pour les appels AJAX
- Chart.js pour les graphiques
- Responsive design

**Sécurité**
- Requêtes SQL paramétrées (protection injection)
- Validation côté serveur
- Transactions atomiques
- Pas de données sensibles exposées

**Performance**
- Base SQLite légère et rapide
- Requêtes optimisées
- Limites sur les résultats
- Index sur champs fréquents

#### 📦 Dépendances

**Production**
- express@^4.18.2
- ejs@^3.1.9
- sqlite3@^5.1.6
- body-parser@^1.20.2
- pdfkit@^0.13.0
- chart.js@^4.4.0

**Développement**
- nodemon@^3.0.1

#### 🎓 Cas d'usage

Idéal pour :
- Petites et moyennes boutiques
- Boulangeries et épiceries
- Pharmacies et librairies
- Quincailleries
- Tout commerce de détail

#### 🌍 Localisation

- Interface en français
- Devise : FC (Franc Congolais)
- Format de date : français (jj/mm/aaaa)
- Méthodes de paiement adaptées (Mobile Money)

#### 📄 Licence

MIT License - Utilisation libre

---

## [À venir]

Voir [ROADMAP.md](ROADMAP.md) pour les fonctionnalités planifiées :

### Version 1.1.0 (prochaine)
- Authentification utilisateur
- Mode sombre
- Amélioration des performances
- Tests automatisés

### Version 2.0.0 (future)
- Gestion multi-magasins
- Module employés
- Application mobile
- Intégrations paiement (API Orange Money, MTN, etc.)

---

## Format des versions

- **MAJOR** (X.0.0) : Changements incompatibles avec l'API
- **MINOR** (0.X.0) : Nouvelles fonctionnalités compatibles
- **PATCH** (0.0.X) : Corrections de bugs

### Types de changements

- **✨ Ajouté** : Nouvelles fonctionnalités
- **🔄 Modifié** : Changements de fonctionnalités existantes
- **⚠️ Déprécié** : Fonctionnalités bientôt supprimées
- **🗑️ Supprimé** : Fonctionnalités retirées
- **🐛 Corrigé** : Corrections de bugs
- **🔐 Sécurité** : Corrections de vulnérabilités

---

**Note** : Pour suggérer des fonctionnalités ou signaler des bugs, ouvrez une issue sur GitHub.
