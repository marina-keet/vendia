# Tests rapides de l'application

## API Endpoints à tester

### 1. Tester les produits

```bash
# Récupérer tous les produits
curl http://localhost:3000/api/products

# Rechercher un produit
curl "http://localhost:3000/api/products?search=coca"

# Récupérer un produit spécifique
curl http://localhost:3000/api/products/1

# Ajouter un nouveau produit
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Produit",
    "description": "Produit de test",
    "price": 1000,
    "stock": 50,
    "category": "Test"
  }'

# Mettre à jour un produit
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coca-Cola 50cl",
    "description": "Boisson gazeuse rafraîchissante",
    "price": 550,
    "stock": 100,
    "category": "Boissons"
  }'

# Supprimer un produit (attention!)
# curl -X DELETE http://localhost:3000/api/products/999
```

### 2. Tester les ventes

```bash
# Créer une vente
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": 1,
        "productName": "Coca-Cola 50cl",
        "quantity": 2,
        "unitPrice": 500
      },
      {
        "productId": 2,
        "productName": "Pain",
        "quantity": 1,
        "unitPrice": 200
      }
    ],
    "paymentMethod": "cash",
    "discount": 0
  }'

# Récupérer toutes les ventes
curl http://localhost:3000/api/sales

# Récupérer une vente spécifique
curl http://localhost:3000/api/sales/1

# Télécharger le reçu d'une vente
curl http://localhost:3000/api/sales/1/receipt -o receipt.pdf
```

### 3. Tester les rapports

```bash
# Statistiques globales
curl http://localhost:3000/api/reports/stats

# Ventes par jour (7 derniers jours)
curl "http://localhost:3000/api/reports/sales-by-day?days=7"

# Ventes par méthode de paiement
curl http://localhost:3000/api/reports/payment-methods

# Top 10 des produits
curl "http://localhost:3000/api/reports/top-products?limit=10"

# Ventes par catégorie
curl http://localhost:3000/api/reports/sales-by-category

# Rapport détaillé avec filtres de date
curl "http://localhost:3000/api/reports/detailed?startDate=2024-11-01&endDate=2024-11-30"
```

### 4. Tester les catégories

```bash
# Récupérer toutes les catégories
curl http://localhost:3000/api/products/meta/categories

# Filtrer par catégorie
curl "http://localhost:3000/api/products?category=Boissons"
```

### 5. Recherche par code-barres

```bash
# Chercher un produit par code-barres
curl http://localhost:3000/api/products/search/barcode/3245678901234
```

## Tests dans le navigateur

### Pages à tester

1. **Dashboard** : http://localhost:3000
   - Vérifier l'affichage des statistiques
   - Vérifier les graphiques

2. **Gestion produits** : http://localhost:3000/products
   - Ajouter un produit
   - Modifier un produit
   - Rechercher un produit
   - Supprimer un produit

3. **Point de vente** : http://localhost:3000/pos
   - Ajouter des produits au panier
   - Modifier les quantités
   - Appliquer une remise
   - Valider une vente
   - Imprimer un reçu

4. **Rapports** : http://localhost:3000/reports
   - Filtrer par date
   - Consulter les graphiques
   - Voir les top produits
   - Exporter en CSV

## Scénarios de test complets

### Scénario 1: Nouvelle vente complète
1. Aller sur `/pos`
2. Ajouter "Coca-Cola" x2
3. Ajouter "Pain" x1
4. Appliquer remise de 100 FC
5. Choisir paiement "Espèces"
6. Valider la vente
7. Imprimer le reçu

### Scénario 2: Gestion de stock
1. Aller sur `/products`
2. Ajouter un nouveau produit avec stock faible (< 5)
3. Vérifier l'alerte sur le dashboard
4. Modifier le stock pour augmenter
5. Vérifier que l'alerte disparaît

### Scénario 3: Analyse des ventes
1. Créer plusieurs ventes avec différents modes de paiement
2. Aller sur `/reports`
3. Filtrer par période
4. Vérifier les graphiques
5. Exporter le rapport CSV

## Maintenance

```bash
# Voir les statistiques de la base de données
node maintenance.js stats

# Créer une sauvegarde
node maintenance.js backup

# Nettoyer les anciens reçus
node maintenance.js clean-receipts
```

## Vérification des fichiers générés

```bash
# Vérifier la base de données
ls -lh database/commerce.db

# Vérifier les reçus générés
ls -lh receipts/

# Vérifier les sauvegardes (si créées)
ls -lh backups/
```

## Points de contrôle

- [ ] Le serveur démarre sans erreur
- [ ] La base de données est créée
- [ ] Les produits de démonstration sont présents
- [ ] Toutes les pages s'affichent correctement
- [ ] Les statistiques se chargent
- [ ] Les graphiques s'affichent
- [ ] Une vente peut être créée
- [ ] Le stock se met à jour après vente
- [ ] Un reçu PDF est généré
- [ ] Les filtres de recherche fonctionnent
- [ ] L'export CSV fonctionne
- [ ] Les alertes de stock s'affichent

## Notes de débogage

Si quelque chose ne fonctionne pas :

1. **Vérifier les logs du serveur** dans le terminal
2. **Ouvrir la console du navigateur** (F12)
3. **Vérifier que la base de données existe** : `ls database/`
4. **Tester les endpoints API** avec curl
5. **Vérifier les permissions** des dossiers receipts/ et database/

## Performance

Pour tester avec beaucoup de données :

```bash
# Script pour insérer 100 produits (à créer si besoin)
# Script pour générer 1000 ventes aléatoires
```

Bon test ! 🧪
