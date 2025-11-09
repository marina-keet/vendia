#!/bin/bash

# Script de vérification du système
# Vérifie que tout est correctement installé et configuré

echo "🔍 Vérification du système de gestion commerciale"
echo "=================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteur de réussite
success=0
total=0

# Fonction de test
check() {
    total=$((total + 1))
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        success=$((success + 1))
    else
        echo -e "${RED}✗${NC} $1"
    fi
}

# 1. Vérifier Node.js
echo "📦 Vérification des prérequis..."
node --version > /dev/null 2>&1
check "Node.js installé ($(node --version 2>/dev/null || echo 'NON TROUVÉ'))"

npm --version > /dev/null 2>&1
check "npm installé ($(npm --version 2>/dev/null || echo 'NON TROUVÉ'))"

echo ""

# 2. Vérifier la structure des dossiers
echo "📁 Vérification de la structure du projet..."

[ -d "database" ]
check "Dossier database/ existe"

[ -d "routes" ]
check "Dossier routes/ existe"

[ -d "views" ]
check "Dossier views/ existe"

[ -d "public" ]
check "Dossier public/ existe"

[ -d "utils" ]
check "Dossier utils/ existe"

[ -d "node_modules" ]
check "Dépendances installées (node_modules/)"

echo ""

# 3. Vérifier les fichiers importants
echo "📄 Vérification des fichiers essentiels..."

[ -f "server.js" ]
check "server.js présent"

[ -f "package.json" ]
check "package.json présent"

[ -f "config.js" ]
check "config.js présent"

[ -f "database/init.js" ]
check "database/init.js présent"

[ -f "routes/products.js" ]
check "routes/products.js présent"

[ -f "routes/sales.js" ]
check "routes/sales.js présent"

[ -f "routes/reports.js" ]
check "routes/reports.js présent"

[ -f "utils/receipt.js" ]
check "utils/receipt.js présent"

echo ""

# 4. Vérifier les vues
echo "🖼️  Vérification des vues..."

[ -f "views/index.ejs" ]
check "views/index.ejs présent"

[ -f "views/products.ejs" ]
check "views/products.ejs présent"

[ -f "views/pos.ejs" ]
check "views/pos.ejs présent"

[ -f "views/reports.ejs" ]
check "views/reports.ejs présent"

[ -f "views/partials/header.ejs" ]
check "views/partials/header.ejs présent"

[ -f "views/partials/footer.ejs" ]
check "views/partials/footer.ejs présent"

echo ""

# 5. Vérifier la documentation
echo "📚 Vérification de la documentation..."

[ -f "README.md" ]
check "README.md présent"

[ -f "QUICKSTART.md" ]
check "QUICKSTART.md présent"

[ -f "GUIDE_UTILISATEUR.md" ]
check "GUIDE_UTILISATEUR.md présent"

[ -f "ARCHITECTURE.md" ]
check "ARCHITECTURE.md présent"

[ -f "TESTS.md" ]
check "TESTS.md présent"

[ -f "ROADMAP.md" ]
check "ROADMAP.md présent"

[ -f "CHANGELOG.md" ]
check "CHANGELOG.md présent"

echo ""

# 6. Vérifier la base de données
echo "💾 Vérification de la base de données..."

if [ -f "database/commerce.db" ]; then
    echo -e "${GREEN}✓${NC} Base de données créée"
    success=$((success + 1))
    
    # Vérifier les tables
    if command -v sqlite3 &> /dev/null; then
        tables=$(sqlite3 database/commerce.db ".tables" 2>/dev/null)
        if [[ $tables == *"products"* ]]; then
            echo -e "${GREEN}✓${NC} Table products existe"
            success=$((success + 1))
        fi
        if [[ $tables == *"sales"* ]]; then
            echo -e "${GREEN}✓${NC} Table sales existe"
            success=$((success + 1))
        fi
        if [[ $tables == *"sale_items"* ]]; then
            echo -e "${GREEN}✓${NC} Table sale_items existe"
            success=$((success + 1))
        fi
        if [[ $tables == *"payments"* ]]; then
            echo -e "${GREEN}✓${NC} Table payments existe"
            success=$((success + 1))
        fi
        total=$((total + 4))
    fi
else
    echo -e "${YELLOW}⚠${NC} Base de données non créée (sera créée au premier démarrage)"
fi

total=$((total + 1))

echo ""

# 7. Vérifier les permissions
echo "🔐 Vérification des permissions..."

[ -w "database" ]
check "Dossier database/ accessible en écriture"

if [ -d "receipts" ]; then
    [ -w "receipts" ]
    check "Dossier receipts/ accessible en écriture"
else
    echo -e "${YELLOW}⚠${NC} Dossier receipts/ sera créé automatiquement"
fi

echo ""

# 8. Vérifier les scripts
echo "🔧 Vérification des scripts..."

[ -f "demo.js" ]
check "Script demo.js présent"

[ -f "maintenance.js" ]
check "Script maintenance.js présent"

echo ""

# Résumé
echo "=================================================="
echo "📊 RÉSUMÉ"
echo "=================================================="
echo ""

percentage=$((success * 100 / total))

if [ $success -eq $total ]; then
    echo -e "${GREEN}✅ Tous les tests réussis !${NC} ($success/$total)"
    echo ""
    echo "🚀 Vous pouvez démarrer l'application avec :"
    echo "   npm start"
    echo ""
    echo "💡 Pour ajouter des données de test :"
    echo "   node demo.js"
elif [ $percentage -ge 80 ]; then
    echo -e "${YELLOW}⚠️  La plupart des tests réussis${NC} ($success/$total - $percentage%)"
    echo ""
    echo "Quelques problèmes mineurs détectés, mais l'application devrait fonctionner."
    echo ""
    echo "🚀 Essayez de démarrer avec :"
    echo "   npm start"
else
    echo -e "${RED}❌ Plusieurs tests échoués${NC} ($success/$total - $percentage%)"
    echo ""
    echo "Des problèmes importants ont été détectés."
    echo ""
    echo "📝 Actions recommandées :"
    echo "   1. Vérifier que Node.js est installé"
    echo "   2. Installer les dépendances : npm install"
    echo "   3. Vérifier les permissions des dossiers"
    echo "   4. Consulter la documentation dans README.md"
fi

echo ""
echo "=================================================="

exit 0
