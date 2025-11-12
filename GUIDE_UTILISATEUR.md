# Guide Utilisateur - Application de Gestion Commerciale

## 🚀 Démarrage de l'application

1. **Installation des dépendances**
   ```bash
   npm install
   ```

2. **Lancer l'application**
   ```bash
   npm start
   ```

3. **Accéder à l'application**
   - Ouvrir votre navigateur à l'adresse : `http://localhost:3000`

---

## 📋 Fonctionnalités principales

### 1. Dashboard (Page d'accueil)

Le tableau de bord vous donne une vue d'ensemble de votre commerce :

- **Statistiques en temps réel** :
  - Nombre de ventes du jour
  - Chiffre d'affaires du jour
  - Nombre total de produits en stock
  - Alertes sur les produits en rupture de stock

- **Graphiques** :
  - Évolution des ventes sur 7 jours
  - Répartition des paiements par méthode

- **Raccourcis rapides** vers les différentes sections

---

### 2. Gestion des Produits (`/products`)

#### Ajouter un nouveau produit
1. Cliquer sur le bouton **"Nouveau Produit"**
2. Remplir les informations :
   - **Nom** (obligatoire)
   - **Description**
   - **Prix en FC** (obligatoire)
   - **Stock** (obligatoire)
   - **Catégorie**
   - **Code-barres** (optionnel)
3. Cliquer sur **"Enregistrer"**

#### Rechercher des produits
- Utiliser la barre de recherche pour trouver un produit par nom ou code-barres
- Filtrer par catégorie avec le menu déroulant

#### Modifier un produit
1. Cliquer sur l'icône **crayon** (✏️) à côté du produit
2. Modifier les informations
3. Enregistrer les modifications

#### Supprimer un produit
1. Cliquer sur l'icône **corbeille** (🗑️)
2. Confirmer la suppression

---

### 3. Point de Vente - Caisse (`/pos`)

Interface simplifiée pour enregistrer rapidement les ventes :

#### Effectuer une vente
1. **Sélectionner les produits** :
   - Cliquer sur les produits affichés
   - OU utiliser la barre de recherche
   - OU scanner un code-barres (si lecteur disponible)

2. **Ajuster les quantités** :
   - Utiliser les boutons **+** et **-** dans le panier
   - Retirer un article avec l'icône **×**

3. **Appliquer une remise** (optionnel) :
   - Saisir le montant de la remise en FC

4. **Choisir le mode de paiement** :
   - Espèces
   - Carte bancaire
   - Mobile Money
   - Autre

5. **Valider la vente** :
   - Cliquer sur **"Valider la vente"**
   - Le stock est automatiquement mis à jour

6. **Imprimer le reçu** :
   - Après validation, possibilité d'imprimer le reçu PDF
   - Ou continuer avec une nouvelle vente

#### Fonctionnalités utiles
- **Vider le panier** : bouton en haut du panier
- **Recherche rapide** : tape sur Enter après avoir saisi un code-barres
- **Alertes stock** : les produits en rupture sont grisés

---

### 4. Rapports et Statistiques (`/reports`)

#### Filtrer les rapports
- Sélectionner une période avec les dates de début et fin
- Cliquer sur **"Filtrer"**

#### Statistiques disponibles
- **Nombre total de ventes** sur la période
- **Chiffre d'affaires total**
- **Vente moyenne**
- **Nombre d'articles vendus**

#### Graphiques
1. **Évolution des ventes (30 jours)** :
   - Courbe du chiffre d'affaires quotidien

2. **Ventes par catégorie** :
   - Histogramme des revenus par catégorie de produits

#### Top produits
- Liste des 10 produits les plus vendus avec :
  - Quantité totale vendue
  - Nombre de ventes
  - Revenu généré

#### Historique des ventes
- Liste détaillée de toutes les ventes
- Possibilité de :
  - **Voir les détails** d'une vente (icône œil 👁️)
  - **Réimprimer le reçu** (icône imprimante 🖨️)

#### Exporter les données
- Cliquer sur **"Exporter"** pour télécharger un fichier CSV
- Le fichier contient toutes les ventes de la période filtrée

---

## 💳 Méthodes de paiement supportées

L'application supporte plusieurs modes de paiement :

1. **Espèces** (cash) - Paiement en liquide
2. **Carte bancaire** (card) - Paiement par carte Visa/Mastercard
3. **Mobile Money** (mobile_money) - Orange Money, MTN Money, Moov Money, etc.
4. **Autre** (other) - Autres modes de paiement

---

## 🧾 Génération de reçus

Chaque vente génère automatiquement un reçu PDF contenant :

- **En-tête** avec les informations du commerce
- **Numéro de vente** unique
- **Date et heure** de la transaction
- **Liste détaillée** des articles :
  - Nom du produit
  - Quantité
  - Prix unitaire
  - Sous-total
- **Total général** avec remise éventuelle
- **Méthode de paiement**
- Message de remerciement

### Accéder aux reçus
- Les reçus sont automatiquement enregistrés dans le dossier `/receipts`
- Format : `receipt-[ID]-[timestamp].pdf`

---

## 📊 Base de données

L'application utilise SQLite avec les tables suivantes :

### `products` - Produits
- id, name, description, price, stock, category, barcode
- Timestamps : created_at, updated_at

### `sales` - Ventes
- id, total_amount, discount, final_amount, payment_method, status
- Timestamp : created_at

### `sale_items` - Articles vendus
- id, sale_id, product_id, product_name, quantity, unit_price, subtotal

### `payments` - Paiements
- id, sale_id, method, amount, reference, status
- Timestamp : created_at

---

## 🔧 Configuration avancée

### Modifier le port du serveur
Dans `server.js`, ligne 6 :
```javascript
const PORT = process.env.PORT || 3000;
```

### Personnaliser les informations du commerce
Dans `utils/receipt.js`, lignes 22-24 :
```javascript
doc.fontSize(12).text('Mon Commerce', { align: 'center' });
doc.fontSize(10).text('123 Rue du Commerce, Ville', { align: 'center' });
doc.text('Tél: +225 XX XX XX XX', { align: 'center' });
```

### Ajouter des produits de démonstration
Les produits de démonstration sont créés automatiquement au premier démarrage dans `database/init.js`

---

## 🚨 Alertes et notifications

### Alertes de stock faible
- Les produits avec un stock ≤ 5 sont marqués en rouge
- Le dashboard affiche le nombre de produits en rupture

### Validation des stocks
- Impossible de vendre plus que le stock disponible
- Message d'erreur si tentative de vente d'un produit en rupture

---

## 💡 Conseils d'utilisation

1. **Mettre à jour régulièrement les stocks** après réception de marchandises
2. **Faire des sauvegardes** de la base de données `commerce.db`
3. **Archiver les reçus** régulièrement (dossier `/receipts`)
4. **Consulter les rapports** quotidiennement pour suivre les performances
5. **Utiliser les catégories** pour mieux organiser les produits
6. **Codes-barres** : facilitent la vente rapide si vous avez un lecteur

---

## 🐛 Résolution de problèmes

### Le serveur ne démarre pas
```bash
# Vérifier que le port 3000 n'est pas déjà utilisé
lsof -i :3000

# Utiliser un autre port
PORT=3001 npm start
```

### Erreur de base de données
```bash
# Supprimer la base de données et la recréer
rm database/commerce.db
npm start
```

### Les reçus ne s'impriment pas
- Vérifier que le dossier `/receipts` existe et est accessible en écriture
- Vérifier les permissions du dossier

---

## 📞 Support

Pour toute question ou problème :
- Consulter les logs du serveur dans le terminal
- Vérifier la console du navigateur (F12)
- Consulter le fichier `README.md`

---

## 🔐 Sécurité

**Recommandations pour la production** :

1. Ajouter une authentification utilisateur
2. Utiliser HTTPS
3. Configurer un pare-feu
4. Sauvegarder régulièrement la base de données
5. Restreindre l'accès au réseau local si nécessaire

---

## 📝 Licence

Ce projet est open source. Vous êtes libre de le modifier selon vos besoins.

Bon commerce ! 🎉
