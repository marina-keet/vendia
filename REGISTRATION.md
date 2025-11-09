# 🔐 Système d'Inscription - Guide Complet

## 📋 Vue d'ensemble

Le système d'inscription permet aux nouveaux utilisateurs de créer un compte pour accéder à l'application de commerce. L'inscription est sécurisée avec validation des données et création automatique de session.

## 🌐 Pages disponibles

### 1. Page de Connexion
- **URL** : `http://localhost:3000/login`
- **Fonctionnalités** :
  - Connexion avec username/password
  - Affichage/masquage du mot de passe
  - Messages d'erreur clairs
  - Lien vers la page d'inscription
  - Informations compte par défaut (admin/admin123)

### 2. Page d'Inscription
- **URL** : `http://localhost:3000/register`
- **Fonctionnalités** :
  - Formulaire d'inscription complet
  - Validation en temps réel
  - Indicateur de force du mot de passe
  - Confirmation du mot de passe
  - Design moderne avec Tailwind CSS
  - Icônes Font Awesome
  - Lien de retour vers la connexion

## 📝 Champs du formulaire d'inscription

| Champ | Type | Requis | Validation |
|-------|------|--------|------------|
| **Nom complet** | text | ✅ | Non vide |
| **Nom d'utilisateur** | text | ✅ | 3-20 caractères, alphanumériques + underscore |
| **Email** | email | ✅ | Format email valide, unique |
| **Mot de passe** | password | ✅ | Minimum 6 caractères |
| **Confirmer mot de passe** | password | ✅ | Doit correspondre au mot de passe |

## 🔒 Sécurité

### Validation côté client (JavaScript)
- ✅ Vérification format username (pattern regex)
- ✅ Vérification longueur mot de passe (min 6)
- ✅ Comparaison mot de passe et confirmation
- ✅ Format email valide
- ✅ Indicateur force du mot de passe (5 niveaux)

### Validation côté serveur (Node.js)
- ✅ Tous les champs requis présents
- ✅ Mots de passe identiques
- ✅ Longueur minimale mot de passe (6 caractères)
- ✅ Username unique (pas de doublons)
- ✅ Email unique (pas de doublons)
- ✅ Hash SHA-256 du mot de passe
- ✅ Protection contre injection SQL (paramètres liés)

## 🔐 Hashage des mots de passe

```javascript
// Utilisation de SHA-256 pour hasher les mots de passe
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256')
    .update(password)
    .digest('hex');
}
```

**Important** : Les mots de passe ne sont JAMAIS stockés en clair dans la base de données.

## 📊 Indicateur de force du mot de passe

L'indicateur évalue la force selon 5 critères :

| Critère | Points |
|---------|--------|
| Longueur ≥ 6 caractères | +1 |
| Longueur ≥ 10 caractères | +1 |
| Majuscules ET minuscules | +1 |
| Contient des chiffres | +1 |
| Contient des caractères spéciaux | +1 |

### Niveaux de force

| Score | Couleur | Label | Barre |
|-------|---------|-------|-------|
| 1 | 🔴 Rouge | Très faible | 20% |
| 2 | 🟠 Orange | Faible | 40% |
| 3 | 🟡 Jaune | Moyen | 60% |
| 4 | 🟢 Vert clair | Fort | 80% |
| 5 | 🟢 Vert foncé | Très fort | 100% |

## 🎯 Rôle par défaut

Lors de l'inscription, les nouveaux utilisateurs reçoivent automatiquement le rôle **`cashier`** (caissier).

### Permissions du rôle Cashier
- ✅ Accès au point de vente (POS)
- ✅ Enregistrer des ventes
- ✅ Voir les produits
- ✅ Voir les clients
- ❌ Modifier les produits
- ❌ Gérer les utilisateurs
- ❌ Modifier les paramètres
- ❌ Accès complet aux rapports

**Note** : Un administrateur peut ensuite changer le rôle vers `manager` ou `admin` depuis la page Utilisateurs.

## 🔄 Processus d'inscription

```
1. Utilisateur remplit le formulaire
   ↓
2. Validation côté client (JavaScript)
   ↓
3. Envoi des données au serveur (POST /api/auth/register)
   ↓
4. Validation côté serveur
   ↓
5. Vérification username unique
   ↓
6. Vérification email unique
   ↓
7. Hash du mot de passe (SHA-256)
   ↓
8. Insertion dans la table users
   ↓
9. Création automatique d'une session
   ↓
10. Retour des données utilisateur + sessionId
   ↓
11. Redirection vers le dashboard
```

## 📡 API Endpoint

### POST /api/auth/register

**Corps de la requête (JSON)** :
```json
{
  "username": "john.doe",
  "password": "motdepasse123",
  "confirm_password": "motdepasse123",
  "email": "john.doe@example.com",
  "full_name": "John Doe",
  "role": "cashier"
}
```

**Réponse succès (200)** :
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "sessionId": "abc123...",
  "user": {
    "id": 5,
    "username": "john.doe",
    "fullName": "John Doe",
    "role": "cashier",
    "email": "john.doe@example.com"
  }
}
```

**Réponses d'erreur** :

| Code | Erreur | Cause |
|------|--------|-------|
| 400 | Tous les champs sont requis | Champs manquants |
| 400 | Les mots de passe ne correspondent pas | password ≠ confirm_password |
| 400 | Le mot de passe doit contenir au moins 6 caractères | password.length < 6 |
| 400 | Ce nom d'utilisateur existe déjà | Username déjà dans la BD |
| 400 | Cet email est déjà utilisé | Email déjà dans la BD |
| 500 | Erreur lors de la création du compte | Erreur base de données |

## 🧪 Tests

### Test automatisé

Un script de test `test-register.js` vérifie 4 scénarios :

```bash
node test-register.js
```

**Tests inclus** :
1. ✅ Inscription réussie avec données valides
2. ✅ Rejet mot de passe trop court (< 6 caractères)
3. ✅ Rejet mots de passe non correspondants
4. ✅ Rejet username déjà existant

### Test manuel

1. Ouvrir `http://localhost:3000/register`
2. Remplir le formulaire
3. Observer l'indicateur de force du mot de passe
4. Cliquer sur "Créer mon compte"
5. Vérifier la redirection vers le dashboard

## 💡 Fonctionnalités UX

### 1. Affichage/Masquage du mot de passe
- Icône œil pour basculer la visibilité
- Fonctionne sur les deux champs (password et confirm)

### 2. Indicateur visuel en temps réel
- Barre colorée qui se remplit selon la force
- Texte descriptif du niveau de sécurité
- Mise à jour instantanée pendant la saisie

### 3. Validation format username
- Pattern HTML5 : `[a-zA-Z0-9_]{3,20}`
- Message d'aide sous le champ
- Empêche la soumission si invalide

### 4. Messages d'erreur clairs
- Encadré rouge avec icône
- Message descriptif de l'erreur
- Disparition automatique après 5 secondes

### 5. Conservation des données en cas d'erreur
- Les champs sont pré-remplis avec les valeurs saisies
- Évite de tout retaper après une erreur

## 🎨 Design

### Thème couleur
- **Gradient principal** : Purple (667eea) → Violet (764ba2)
- **Boutons** : Dégradé purple-600 → indigo-600
- **Icônes** : Font Awesome 6.4.0
- **Framework CSS** : Tailwind CSS (via CDN)

### Responsive
- ✅ Mobile-first
- ✅ Largeur max 28rem (448px) sur desktop
- ✅ Padding adaptatif
- ✅ Formulaire scrollable sur petits écrans

## 🔗 Navigation

### Depuis la page de connexion
```html
<a href="/register">Créer un compte</a>
```

### Depuis la page d'inscription
```html
<a href="/login">Se connecter</a>
```

## 📂 Fichiers modifiés/créés

```
vendia/
├── views/
│   ├── login.ejs (modifié - ajout lien inscription)
│   └── register.ejs (créé)
├── routes/
│   └── auth.js (modifié - ajout route POST /register)
├── server.js (modifié - ajout route GET /register)
├── test-register.js (créé)
└── REGISTRATION.md (ce fichier)
```

## 🚀 Utilisation

### Pour les utilisateurs

1. **Accéder à la page** : `http://localhost:3000/register`
2. **Remplir le formulaire** avec vos informations
3. **Créer le compte** : Cliquer sur "Créer mon compte"
4. **Connexion automatique** : Redirection vers le dashboard

### Pour les développeurs

```bash
# Démarrer le serveur
npm start

# Tester l'inscription
node test-register.js

# Vérifier les nouveaux utilisateurs
sqlite3 database/commerce.db "SELECT * FROM users;"
```

## 🔧 Configuration

### Modifier le rôle par défaut

Dans `routes/auth.js`, ligne ~45 :
```javascript
const userRole = role || 'cashier'; // Changer 'cashier' par 'manager' ou 'admin'
```

### Modifier la longueur minimale du mot de passe

Dans `routes/auth.js`, ligne ~20 :
```javascript
if (password.length < 6) { // Changer 6 par une autre valeur
```

### Désactiver la création automatique de session

Dans `routes/auth.js`, ligne ~58, commenter :
```javascript
// createSession(db, newUserId, (err, sessionId) => { ... });
```

## ✅ Checklist de sécurité

- [x] Mots de passe hashés (SHA-256)
- [x] Validation côté client et serveur
- [x] Protection injection SQL (paramètres liés)
- [x] Vérification unicité username/email
- [x] Longueur minimale mot de passe (6)
- [x] Confirmation mot de passe obligatoire
- [x] Messages d'erreur sans révéler d'infos sensibles
- [x] Sessions sécurisées avec expiration (7 jours)
- [x] Rôle par défaut restrictif (cashier)
- [x] HTTPS recommandé en production

## 📈 Statistiques

Après inscription, les utilisateurs peuvent :
- ✅ Se connecter immédiatement (session créée)
- ✅ Accéder au dashboard
- ✅ Utiliser le point de vente
- ✅ Voir leurs informations dans Paramètres

Un administrateur peut :
- ✅ Voir le nouvel utilisateur dans la page Utilisateurs
- ✅ Modifier son rôle
- ✅ Désactiver le compte si besoin
- ✅ Voir la date de création (created_at)

## 🎓 Bonnes pratiques

### Pour les utilisateurs
1. Choisir un mot de passe fort (niveau ≥ 4)
2. Utiliser un email valide et accessible
3. Choisir un username unique et mémorable
4. Ne jamais partager ses identifiants

### Pour les administrateurs
1. Vérifier les nouveaux comptes régulièrement
2. Ajuster les rôles selon les besoins
3. Désactiver les comptes inactifs
4. Former les utilisateurs aux bonnes pratiques

## 🐛 Dépannage

### L'inscription ne fonctionne pas
1. Vérifier que le serveur est démarré (`npm start`)
2. Vérifier que la base de données existe
3. Consulter les logs du serveur
4. Tester avec `test-register.js`

### Message "Username déjà existant"
- Choisir un autre nom d'utilisateur
- Vérifier dans la base : `SELECT username FROM users;`

### Message "Email déjà utilisé"
- Utiliser un autre email
- Vérifier dans la base : `SELECT email FROM users;`

## 📞 Support

Pour toute question ou problème :
1. Consulter cette documentation
2. Vérifier les tests automatisés
3. Consulter le fichier `AUTHENTICATION.md`
4. Vérifier les logs du serveur

---

**Version** : 2.1  
**Date** : 8 novembre 2025  
**Auteur** : Système de gestion de commerce
