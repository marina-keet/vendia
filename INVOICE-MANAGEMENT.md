
╔══════════════════════════════════════════════════════════════════════╗
║     📋 GESTION COMPLÈTE DES FACTURES - ADMIN CONFIGURÉ ✅           ║
╚══════════════════════════════════════════════════════════════════════╝

🎯 NOUVELLES FONCTIONNALITÉS ADMIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Gestion des factures (Ventes)
   • Visualiser toutes les factures
   • Modifier une facture existante
   • Supprimer une facture
   • Filtrer par date et mode de paiement
   • Voir les détails complets

✅ Amélioration des PDF (Reçus)
   • Logo personnalisé sur les reçus
   • Couleurs configurables (primaire/secondaire)
   • Design professionnel et moderne
   • Affichage dual currency (FC + USD)
   • Informations entreprise complètes
   • Taux de change affiché

✅ Upload de logo
   • Interface dans Paramètres > Entreprise
   • Formats acceptés : JPG, PNG, GIF, SVG
   • Taille max : 5MB
   • Aperçu en temps réel
   • Suppression possible


📂 PAGES AJOUTÉES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Page Gestion des Factures
   URL : http://localhost:3000/invoices
   Accès : Admin uniquement
   
   Fonctionnalités :
   ┌─────────────────────────────────────────┐
   │ 🔍 Filtres de recherche                 │
   │   • Date de début / fin                 │
   │   • Mode de paiement                    │
   │                                         │
   │ 📊 Tableau des factures                 │
   │   • N° facture                          │
   │   • Date et heure                       │
   │   • Nom du caissier                     │
   │   • Montant total, remise, net à payer  │
   │   • Mode de paiement                    │
   │                                         │
   │ 🔧 Actions sur chaque facture          │
   │   👁️ Voir détails complets             │
   │   ✏️ Modifier la facture                │
   │   📥 Télécharger PDF                    │
   │   🗑️ Supprimer (avec confirmation)     │
   └─────────────────────────────────────────┘

2️⃣ Page Modification de Facture
   URL : http://localhost:3000/edit-invoice/:id
   Accès : Admin uniquement
   
   Fonctionnalités :
   ┌─────────────────────────────────────────┐
   │ 📋 Informations facture                 │
   │   • Date de création                    │
   │   • Nom du caissier                     │
   │   • Mode de paiement                    │
   │   • Total original                      │
   │                                         │
   │ 🛍️ Modification articles                │
   │   • Ajouter des produits                │
   │   • Modifier quantités                  │
   │   • Retirer des articles                │
   │                                         │
   │ 💰 Ajustements                          │
   │   • Modifier remise                     │
   │   • Ajouter/modifier notes              │
   │   • Changer client                      │
   │                                         │
   │ 💱 Calculs automatiques                 │
   │   • Sous-total mis à jour               │
   │   • Total en FC + équivalent USD        │
   │   • Restauration du stock               │
   └─────────────────────────────────────────┘

3️⃣ Paramètres - Section Logo
   URL : http://localhost:3000/settings
   Onglet : Entreprise
   
   Interface d'upload :
   ┌─────────────────────────────────────────┐
   │ 🖼️ Aperçu du logo                       │
   │   [          Logo actuel         ]      │
   │                                         │
   │ 📤 Upload                               │
   │   [ Choisir un logo ]                   │
   │   [ Supprimer      ]                    │
   │                                         │
   │ ℹ️ Info : JPG, PNG, GIF, SVG (5MB max) │
   └─────────────────────────────────────────┘


🔧 API ROUTES AJOUTÉES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gestion des factures :
  DELETE /api/sales/:id
    → Supprimer une facture (admin uniquement)
    → Restaure automatiquement le stock
    → Supprime sale, sale_items, payments

  PUT /api/sales/:id
    → Modifier une facture (admin uniquement)
    → Restaure ancien stock
    → Met à jour avec nouveaux items
    → Recalcule totaux

Upload de logo :
  POST /api/settings/upload-logo
    → Upload fichier logo (admin uniquement)
    → Sauvegarde dans /public/uploads/
    → Met à jour settings.logo
    → Supprime ancien logo

  DELETE /api/settings/logo
    → Supprimer le logo (admin uniquement)
    → Supprime fichier physique
    → Met à jour settings


📄 PDF AMÉLIORÉ (Reçus)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nouveau design professionnel :

┌─────────────────────────────────────────┐
│  [Logo]                                 │
│                                         │
│        REÇU DE VENTE                    │
│                                         │
│        Mon Commerce                     │
│    Kinshasa, RDC                        │
│  Tél: +243 XX XX XX XX                  │
│  Email: contact@moncommerce.cd          │
│                                         │
├─────────────────────────────────────────┤
│  N° de vente: 15    Date: 08/11/2025    │
│  Client ID: 3       Note: Urgent        │
├─────────────────────────────────────────┤
│                                         │
│  Article   Qté  P.U.      Total        │
│  ────────────────────────────────────   │
│  Coca      2    500 FC    1 000 FC     │
│  Pain      3    200 FC    600 FC       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│          Sous-total:      1 600 FC      │
│          Remise:          -100 FC       │
│          ─────────────────────────      │
│          TOTAL:           1 500 FC      │
│          Équivalent:      0.60 $        │
│          (Taux: 1 $ = 2500 FC)          │
│                                         │
│  Mode de paiement: Espèces              │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│       Merci de votre visite!            │
│            À bientôt!                   │
│                                         │
│  Imprimé le 08/11/2025 14:30 | Page 1   │
└─────────────────────────────────────────┘

Caractéristiques :
  • Logo en haut (si uploadé)
  • Couleurs personnalisables
  • Lignes alternées pour lisibilité
  • Dual currency (FC + USD)
  • Taux de change affiché
  • Informations entreprise complètes
  • Footer avec date d'impression


🔐 PERMISSIONS & SÉCURITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Accès restreint ADMIN uniquement :
  ✓ Voir toutes les factures
  ✓ Modifier n'importe quelle facture
  ✓ Supprimer des factures
  ✓ Uploader/supprimer logo

Managers & Caissiers :
  ✗ Pas d'accès à /invoices
  ✗ Pas d'accès à /edit-invoice
  ✓ Peuvent créer des ventes (POS)
  ✓ Peuvent voir leurs propres ventes

Sécurité :
  • Vérification du rôle côté serveur
  • Restauration automatique du stock
  • Transactions SQL (rollback si erreur)
  • Validation des fichiers uploadés


🔄 WORKFLOW MODIFICATION FACTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Admin ouvre /invoices
   → Liste toutes les factures

2️⃣ Clic sur "Modifier" (✏️)
   → Ouvre /edit-invoice/:id

3️⃣ Page de modification
   → Charge facture existante
   → Affiche articles actuels
   → Charge liste des produits disponibles

4️⃣ Modifications possibles
   → Ajouter/retirer articles
   → Changer quantités
   → Modifier remise
   → Changer client
   → Ajouter notes

5️⃣ Sauvegarde
   → PUT /api/sales/:id
   → Restaure ancien stock
   → Déduit nouveau stock
   → Met à jour sale, sale_items, payments
   → Recalcule totaux

6️⃣ Confirmation
   → Message de succès
   → Retour à /invoices


🗑️ WORKFLOW SUPPRESSION FACTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Admin ouvre /invoices
   → Liste toutes les factures

2️⃣ Clic sur "Supprimer" (🗑️)
   → Modal de confirmation

3️⃣ Confirmation
   → "Êtes-vous sûr ?"
   → Action irréversible

4️⃣ Suppression
   → DELETE /api/sales/:id
   → Restaure le stock des produits
   → Supprime sale_items
   → Supprime payments
   → Supprime sale

5️⃣ Confirmation
   → Message de succès
   → Liste actualisée


📤 WORKFLOW UPLOAD LOGO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Admin ouvre /settings
   → Onglet "Entreprise"

2️⃣ Section Logo
   → Aperçu logo actuel (si existe)
   → Bouton "Choisir un logo"

3️⃣ Sélection fichier
   → JPG, PNG, GIF ou SVG
   → Max 5MB

4️⃣ Upload
   → POST /api/settings/upload-logo
   → Sauvegarde dans /public/uploads/
   → Supprime ancien logo
   → Met à jour settings.logo

5️⃣ Confirmation
   → Aperçu mis à jour
   → Bouton "Supprimer" visible
   → Logo disponible sur tous les reçus


💡 AMÉLIORATIONS APPORTÉES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Flexibilité
   Admin peut corriger erreurs de saisie
   Modification complète des factures
   Suppression si besoin

✅ Traçabilité
   Historique des factures
   Filtres par date/paiement
   Détails complets accessibles

✅ Professionnalisme
   Logo sur reçus
   Design moderne et coloré
   Dual currency (FC/USD)
   Informations complètes

✅ Gestion du stock
   Restauration automatique
   Pas de décalage en cas de modif/suppression
   Transactions sécurisées

✅ Interface intuitive
   Boutons d'action clairs
   Modals de confirmation
   Messages d'erreur explicites
   Design responsive


📂 FICHIERS CRÉÉS/MODIFIÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nouveaux fichiers :
  📄 views/invoices.ejs          → Page liste factures
  📄 views/edit-invoice.ejs      → Page modification facture
  📁 public/uploads/             → Dossier pour logos

Fichiers modifiés :
  📝 routes/sales.js             → Routes DELETE et PUT
  📝 routes/settings.js          → Routes upload logo
  📝 utils/receipt.js            → PDF amélioré avec logo
  📝 views/settings.ejs          → Section upload logo
  📝 server.js                   → Routes /invoices et /edit-invoice
  📝 package.json                → Ajout de multer

Nouvelles dépendances :
  📦 multer                      → Upload de fichiers


🧪 TESTS RECOMMANDÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Créer quelques ventes
   ✓ Via POS
   ✓ Différents produits
   ✓ Différentes remises

2. Tester page /invoices
   ✓ Liste affichée correctement
   ✓ Filtres fonctionnent
   ✓ Détails s'affichent

3. Modifier une facture
   ✓ Ouvrir /edit-invoice/:id
   ✓ Ajouter/retirer articles
   ✓ Modifier remise
   ✓ Sauvegarder
   ✓ Vérifier stock restauré

4. Supprimer une facture
   ✓ Confirmer suppression
   ✓ Vérifier stock restauré
   ✓ Vérifier disparition

5. Upload logo
   ✓ Uploader logo dans /settings
   ✓ Vérifier aperçu
   ✓ Télécharger PDF avec logo
   ✓ Supprimer logo
   ✓ Vérifier PDF sans logo

6. Tester PDF amélioré
   ✓ Télécharger reçu
   ✓ Vérifier logo présent
   ✓ Vérifier couleurs
   ✓ Vérifier dual currency
   ✓ Vérifier infos complètes


╔══════════════════════════════════════════════════════════════════════╗
║              ✅ GESTION COMPLÈTE DES FACTURES ADMIN                  ║
║                                                                      ║
║  📋 Visualiser toutes les factures                                  ║
║  ✏️ Modifier n'importe quelle facture                               ║
║  🗑️ Supprimer des factures (avec restauration stock)               ║
║  🖼️ Upload logo personnalisé                                        ║
║  📄 PDF améliorés avec logo + couleurs + dual currency              ║
║  💱 Affichage FC + USD sur tous les reçus                           ║
║  🔐 Accès réservé aux admins                                        ║
║                                                                      ║
║  🇨🇩 Parfait pour la gestion complète en RDC                        ║
║                                                                      ║
║  👉 Page factures : http://localhost:3000/invoices                  ║
║  👉 Paramètres : http://localhost:3000/settings                     ║
║     Login : admin / admin123                                        ║
╚══════════════════════════════════════════════════════════════════════╝
