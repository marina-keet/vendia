# 🚀 Guide de démarrage rapide - Version 2.0.0

## En 5 étapes simples

### Étape 1 : Installation (une seule fois)

```bash
npm install
```

Cette commande installe toutes les dépendances nécessaires.

---

### Étape 2 : Démarrage de l'application

```bash
npm start
```

Le serveur démarre automatiquement. Vous verrez :

```
Base de données initialisée avec succès!
✅ Schéma étendu avec succès (Users, Customers, Settings)
🚀 Serveur démarré sur http://localhost:3000
📊 Dashboard: http://localhost:3000
🛒 Point de vente: http://localhost:3000/pos
📦 Produits: http://localhost:3000/products
📈 Rapports: http://localhost:3000/reports
👤 Utilisateur admin créé (username: admin, password: admin123)
```

---

### Étape 3 : 🔐 Première connexion

1. Ouvrez votre navigateur : **http://localhost:3000**
2. Vous serez redirigé vers la page de connexion
3. Utilisez les identifiants par défaut :
   - **Utilisateur :** `admin`
   - **Mot de passe :** `admin123`
4. Cliquez sur **"Se connecter"**

⚠️ **IMPORTANT :** Changez le mot de passe administrateur immédiatement après la première connexion !

---

### Étape 4 : ⚙️ Configuration initiale (5 min)

Après connexion, configurez votre commerce :

1. **Aller dans Paramètres** (menu utilisateur en haut à droite > Paramètres)
2. **Onglet Entreprise :**
   - Nom de votre commerce
   - Adresse, téléphone, email
   - Numéro fiscal
3. **Onglet Général :**
   - Devise (FCFA par défaut)
   - Taux de TVA
4. **Onglet Inventaire :**
   - Seuils d'alerte stock
5. **Enregistrer**

---

### Étape 5 : 👥 Créer vos utilisateurs (5 min)

1. **Aller dans Utilisateurs** (menu > Utilisateurs)
2. **Créer des comptes pour votre équipe :**
   - **Caissiers** : Accès au point de vente
   - **Gérants** : Accès complet sauf utilisateurs/paramètres
   - **Admins** : Accès total (vous)

---

## 🎭 Données de démonstration (optionnel)

Pour tester l'application avec des données réalistes :

```bash
# Dans un nouveau terminal (laissez le serveur tourner)
node demo.js
```

Cela ajoute :
- ✅ 20 produits supplémentaires
- ✅ 10 ventes de démonstration
- ✅ 3 clients de test
- ✅ Données réalistes pour tous les rapports

---

## 📱 Navigation rapide

Une fois connecté, vous avez accès à :

| Page | URL | Accès | Description |
|------|-----|-------|-------------|
| 🏠 **Dashboard** | http://localhost:3000 | Tous | Vue d'ensemble et statistiques |
| 📦 **Produits** | http://localhost:3000/products | Tous | Gérer vos produits et stocks |
| 💰 **Caisse (POS)** | http://localhost:3000/pos | Tous | Point de vente pour enregistrer les ventes |
| 📊 **Rapports** | http://localhost:3000/reports | Tous | Statistiques et analyses détaillées |
| 📋 **Ventes** | http://localhost:3000/sales | Tous | Historique complet des ventes |
| 👥 **Clients** | http://localhost:3000/customers | Tous | Gestion de la clientèle |
| 🔧 **Utilisateurs** | http://localhost:3000/users | Admin/Manager | Gestion des employés |
| ⚙️ **Paramètres** | http://localhost:3000/settings | Admin | Configuration du système |

---

## 🎯 Premiers pas recommandés

### 1. Changer le mot de passe admin (1 min) 🔒

1. **Menu utilisateur** (en haut à droite) > **Utilisateurs**
2. Cliquer sur l'icône **🔑** à côté de votre compte
3. Entrer un **nouveau mot de passe sécurisé**
4. Confirmer et enregistrer

### 2. Ajouter vos produits (5 min) 📦

1. Aller sur **Produits** (http://localhost:3000/products)
2. Cliquer sur **"Nouveau Produit"**
3. Remplir :
   - Nom du produit
   - Prix en FCFA
   - Quantité en stock
   - Catégorie (optionnel)
4. Enregistrer

**Astuce** : Ajoutez des codes-barres pour accélérer les ventes !

---

### 2. Effectuer votre première vente (1 min)

1. Aller sur **Caisse** (http://localhost:3000/pos)
2. Cliquer sur les produits à vendre
3. Ajuster les quantités avec + et -
4. Choisir le mode de paiement (Espèces, Carte, Mobile Money)
5. Cliquer sur **"Valider la vente"**
6. Imprimer le reçu (optionnel)

**Astuce** : Utilisez la barre de recherche pour trouver rapidement un produit !

---

### 3. Consulter vos statistiques (30 sec)

1. Retourner sur le **Dashboard** (http://localhost:3000)
2. Voir en temps réel :
   - Nombre de ventes du jour
   - Chiffre d'affaires
   - Produits en stock faible
   - Graphiques des ventes

---

## 💡 Astuces utiles

### Raccourcis clavier dans la caisse
- Cliquer sur un produit = l'ajouter au panier
- Scanner un code-barres = ajouter directement le produit
- Appuyer sur **Entrée** après avoir scanné = validation

### Gestion du stock
- Les produits avec stock ≤ 5 sont marqués en **rouge**
- Le stock se met à jour **automatiquement** après chaque vente
- Alerte sur le dashboard si des produits sont en rupture

### Recherche rapide
- Dans **Produits** : rechercher par nom ou code-barres
- Dans **Caisse** : taper le nom ou scanner le code-barres
- Dans **Rapports** : filtrer par date ou méthode de paiement

---

## 🛑 Arrêter l'application

Dans le terminal où tourne le serveur, appuyer sur :

```
Ctrl + C
```

Pour redémarrer plus tard :

```bash
npm start
```

---

## ❓ Problèmes courants

### Le port 3000 est déjà utilisé

**Solution 1** : Arrêter l'application qui utilise le port
```bash
# Trouver le processus
lsof -i :3000
# Tuer le processus
kill -9 [PID]
```

**Solution 2** : Utiliser un autre port
```bash
PORT=3001 npm start
```

---

### La base de données ne se crée pas

**Solution** : Vérifier les permissions du dossier
```bash
chmod -R 755 database/
npm start
```

---

### Les reçus ne se génèrent pas

**Solution** : Créer le dossier receipts
```bash
mkdir -p receipts
chmod 755 receipts
```

---

## 📞 Besoin d'aide ?

- 📖 Consulter le [Guide utilisateur complet](GUIDE_UTILISATEUR.md)
- 🏗️ Voir l'[Architecture du projet](ARCHITECTURE.md)
- 🧪 Lire le [Guide de tests](TESTS.md)
- 🗺️ Découvrir la [Roadmap](ROADMAP.md)

---

## ✅ Checklist de démarrage

- [ ] Node.js installé (v14+)
- [ ] Dépendances installées (`npm install`)
- [ ] Serveur démarré (`npm start`)
- [ ] Application accessible sur http://localhost:3000
- [ ] Premier produit ajouté
- [ ] Première vente effectuée
- [ ] Reçu généré avec succès

---

**Félicitations ! Vous êtes prêt à gérer votre commerce ! 🎉**

---

## 🎓 Aller plus loin

### Personnalisation

Éditer `config.js` pour :
- Changer les informations du commerce (nom, adresse, téléphone)
- Modifier le message sur les reçus
- Ajuster les seuils d'alerte de stock

### Sauvegarde

```bash
# Créer une sauvegarde manuelle
node maintenance.js backup
```

Les sauvegardes sont stockées dans le dossier `/backups`

### Maintenance

```bash
# Voir les statistiques
node maintenance.js stats

# Nettoyer les anciens reçus (> 30 jours)
node maintenance.js clean-receipts
```

---

**Bon commerce ! 🏪**
