# 🏪 Application de Gestion Commerciale

Une application web moderne et complète pour gérer efficacement votre commerce avec **authentification multi-utilisateurs** et **gestion avancée**.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ Fonctionnalités principales

### 🔐 **NOUVEAU** - Authentification et Multi-Utilisateurs
- ✅ Système d'authentification sécurisé
- ✅ 3 rôles : Administrateur, Gérant, Caissier
- ✅ Gestion complète des utilisateurs
- ✅ Permissions granulaires par rôle
- ✅ Sessions sécurisées avec expiration
- ✅ Traçabilité des opérations

### � **NOUVEAU** - Gestion des Clients
- ✅ Base de données clients complète
- ✅ Programme de fidélité avec points
- ✅ Historique d'achat par client
- ✅ Statistiques clients détaillées
- ✅ Liaison automatique des ventes
- ✅ Recherche et filtres avancés

### 📋 **NOUVEAU** - Historique des Ventes Avancé
- ✅ Vue complète de toutes les ventes
- ✅ Filtres par date, paiement, client
- ✅ Détails complets de chaque vente
- ✅ Identification du vendeur
- ✅ Réimpression des reçus
- ✅ Export et pagination

### ⚙️ **NOUVEAU** - Paramètres Configurables
- ✅ Configuration de l'entreprise
- ✅ Gestion de la devise et TVA
- ✅ Paramètres de stock et alertes
- ✅ Personnalisation des reçus
- ✅ Programme de fidélité configurable
- ✅ Interface par onglets

### �📦 Gestion des produits
- ✅ Créer, modifier, supprimer des produits
- ✅ Gestion du stock en temps réel
- ✅ Organisation par catégories
- ✅ Support des codes-barres
- ✅ Recherche rapide et filtres
- ✅ Alertes de stock faible

### 💰 Point de vente (POS)
- ✅ Interface intuitive et rapide
- ✅ Ajout de produits par clic ou scan
- ✅ **Sélection de client** pour la vente
- ✅ Gestion du panier dynamique
- ✅ Application de remises
- ✅ Multiples méthodes de paiement
- ✅ Validation instantanée

### 💳 Gestion des paiements
- ✅ Espèces
- ✅ Carte bancaire
- ✅ Mobile Money (Orange Money, MTN, etc.)
- ✅ Autres modes de paiement
- ✅ Historique complet des transactions

### 📊 Rapports et statistiques
- ✅ Dashboard avec KPIs en temps réel
- ✅ Graphiques interactifs (Chart.js)
- ✅ Ventes par jour/semaine/mois
- ✅ Top des produits vendus
- ✅ Analyse par catégorie
- ✅ **Statistiques par utilisateur et client**
- ✅ Export CSV des rapports

### 🧾 Génération de reçus
- ✅ Reçus PDF professionnels
- ✅ Génération automatique
- ✅ Téléchargement et impression
- ✅ Archivage automatique

---

## 🚀 Installation rapide

### Prérequis
- Node.js (v14 ou supérieur)
- npm ou yarn

### Étapes d'installation

```bash
# Installer les dépendances
npm install

# Lancer l'application
npm start
```

L'application sera accessible sur **http://localhost:3000**

### 🔐 **Première Connexion**

**Identifiants par défaut :**
- **Utilisateur :** `admin`
- **Mot de passe :** `admin123`

⚠️ **Important :** Changez le mot de passe administrateur immédiatement après la première connexion !

---

## 📚 Documentation Complète

- 📖 **[AUTHENTICATION.md](AUTHENTICATION.md)** - Guide complet de l'authentification et multi-utilisateurs
- 📘 **[GUIDE_UTILISATEUR.md](GUIDE_UTILISATEUR.md)** - Manuel d'utilisation détaillé
- 🏗️ **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture technique
- 🧪 **[TESTS.md](TESTS.md)** - Guide de tests
- 🗺️ **[ROADMAP.md](ROADMAP.md)** - Feuille de route
- 📝 **[CHANGELOG.md](CHANGELOG.md)** - Historique des versions

---

## 🛠️ Technologies utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite3** - Base de données légère
- **PDFKit** - Génération de PDF
- **Crypto** - Hachage sécurisé des mots de passe

### Frontend
- **EJS** - Moteur de templates
- **Tailwind CSS** - Framework CSS moderne
- **Chart.js** - Graphiques interactifs
- **Font Awesome** - Icônes

---

## 📚 Documentation complète

- 📖 [Guide utilisateur](GUIDE_UTILISATEUR.md) - Guide complet d'utilisation
- 🏗️ [Architecture](ARCHITECTURE.md) - Documentation technique
- 🧪 [Tests](TESTS.md) - Guide de tests
- 🗺️ [Roadmap](ROADMAP.md) - Fonctionnalités futures

---

## 🎯 Démarrage rapide

### 1. Premier lancement

```bash
npm start
```

### 2. Générer des données de démonstration

```bash
node demo.js
```

Cela créera :
- 28 produits de test
- 10 ventes de démonstration
- Données réalistes pour explorer l'application

### 3. Accéder aux différentes pages

- **Dashboard** : http://localhost:3000
- **Produits** : http://localhost:3000/products
- **Point de vente** : http://localhost:3000/pos
- **Rapports** : http://localhost:3000/reports

---

## 🔧 Scripts disponibles

```bash
# Démarrage normal
npm start

# Mode développement avec auto-reload
npm run dev

# Générer des données de démonstration
node demo.js

# Maintenance
node maintenance.js stats           # Voir les statistiques
node maintenance.js backup          # Créer une sauvegarde
node maintenance.js clean-receipts  # Nettoyer les anciens reçus
```

---

## 📊 Structure du projet

```
vendia/
├── database/        # Base de données SQLite
├── public/          # Fichiers statiques (CSS, images)
├── receipts/        # Reçus PDF générés
├── routes/          # Routes API Express
├── utils/           # Utilitaires (génération PDF)
├── views/           # Templates EJS
├── config.js        # Configuration
├── server.js        # Point d'entrée
└── package.json     # Dépendances
```

---

**Fait avec ❤️ pour les commerçants**

Version 1.0.0 - Novembre 2024
