#!/bin/bash

# Script de vérification de santé - Vendia POS
# Usage: ./health-check.sh

echo "🏥 Vérification de santé Vendia POS"
echo "===================================="

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0

# 1. Vérifier Node.js
echo -e "\n${YELLOW}[1/8]${NC} Node.js"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Installé: $(node -v)${NC}"
else
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    ERRORS=$((ERRORS+1))
fi

# 2. Vérifier npm
echo -e "\n${YELLOW}[2/8]${NC} npm"
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ Installé: $(npm -v)${NC}"
else
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    ERRORS=$((ERRORS+1))
fi

# 3. Vérifier MongoDB
echo -e "\n${YELLOW}[3/8]${NC} MongoDB"
if systemctl is-active --quiet mongod; then
    echo -e "${GREEN}✅ Service actif${NC}"
    
    # Tester connexion
    if mongo --eval "db.version()" > /dev/null 2>&1; then
        MONGO_VERSION=$(mongo --eval "db.version()" --quiet)
        echo -e "${GREEN}✅ Version: $MONGO_VERSION${NC}"
    fi
else
    echo -e "${RED}❌ MongoDB n'est pas actif${NC}"
    echo -e "${YELLOW}   Démarrer: sudo systemctl start mongod${NC}"
    ERRORS=$((ERRORS+1))
fi

# 4. Vérifier port 3000
echo -e "\n${YELLOW}[4/8]${NC} Port 3000"
if lsof -i:3000 > /dev/null 2>&1; then
    PID=$(lsof -ti:3000)
    echo -e "${GREEN}✅ En écoute (PID: $PID)${NC}"
else
    echo -e "${RED}❌ Aucun service sur le port 3000${NC}"
    ERRORS=$((ERRORS+1))
fi

# 5. Vérifier fichier .env
echo -e "\n${YELLOW}[5/8]${NC} Configuration (.env)"
if [ -f .env ]; then
    echo -e "${GREEN}✅ Fichier .env existe${NC}"
else
    echo -e "${RED}❌ Fichier .env manquant${NC}"
    ERRORS=$((ERRORS+1))
fi

# 6. Vérifier dossiers
echo -e "\n${YELLOW}[6/8]${NC} Dossiers requis"
MISSING_DIRS=0
for dir in logs receipts public views models routes; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ $dir/${NC}"
    else
        echo -e "${RED}❌ $dir/ manquant${NC}"
        MISSING_DIRS=$((MISSING_DIRS+1))
    fi
done
if [ $MISSING_DIRS -gt 0 ]; then
    ERRORS=$((ERRORS+1))
fi

# 7. Vérifier modules npm
echo -e "\n${YELLOW}[7/8]${NC} Dépendances npm"
if [ -d node_modules ]; then
    MODULE_COUNT=$(ls -1 node_modules | wc -l)
    echo -e "${GREEN}✅ $MODULE_COUNT modules installés${NC}"
else
    echo -e "${RED}❌ node_modules/ manquant${NC}"
    echo -e "${YELLOW}   Installer: npm install${NC}"
    ERRORS=$((ERRORS+1))
fi

# 8. Tester l'API
echo -e "\n${YELLOW}[8/8]${NC} Test API"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API répond${NC}"
    
    # Tester endpoint spécifique
    if curl -s http://localhost:3000/api/reports/stats > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Endpoint /api/reports/stats OK${NC}"
    else
        echo -e "${YELLOW}⚠️  Endpoint /api/reports/stats ne répond pas${NC}"
    fi
else
    echo -e "${RED}❌ API ne répond pas${NC}"
    ERRORS=$((ERRORS+1))
fi

# Résumé
echo -e "\n===================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Système en bonne santé !${NC}"
    echo -e "${GREEN}   Aucun problème détecté${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS problème(s) détecté(s)${NC}"
    echo -e "${YELLOW}   Consultez les messages ci-dessus${NC}"
    exit 1
fi
