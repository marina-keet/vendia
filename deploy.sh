#!/bin/bash

# Script de déploiement Vendia POS
# Usage: ./deploy.sh

echo "🚀 Déploiement de Vendia POS"
echo "=============================="

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier Node.js
echo -e "\n${YELLOW}[1/10]${NC} Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Vérifier npm
echo -e "\n${YELLOW}[2/10]${NC} Vérification de npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Vérifier MongoDB
echo -e "\n${YELLOW}[3/10]${NC} Vérification de MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB CLI non trouvé${NC}"
else
    echo -e "${GREEN}✅ MongoDB installé${NC}"
fi

# Installation des dépendances
echo -e "\n${YELLOW}[4/10]${NC} Installation des dépendances..."
npm install --production
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dépendances installées${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'installation${NC}"
    exit 1
fi

# Créer .env si n'existe pas
echo -e "\n${YELLOW}[5/10]${NC} Vérification du fichier .env..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Fichier .env manquant${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env créé depuis .env.example${NC}"
        echo -e "${RED}⚠️  IMPORTANT: Modifiez le fichier .env avec vos valeurs !${NC}"
    else
        echo -e "${RED}❌ .env.example manquant${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Fichier .env existe${NC}"
fi

# Créer dossiers nécessaires
echo -e "\n${YELLOW}[6/10]${NC} Création des dossiers..."
mkdir -p logs receipts
echo -e "${GREEN}✅ Dossiers créés${NC}"

# Vérifier MongoDB actif
echo -e "\n${YELLOW}[7/10]${NC} Vérification de MongoDB..."
if systemctl is-active --quiet mongod; then
    echo -e "${GREEN}✅ MongoDB est actif${NC}"
else
    echo -e "${YELLOW}⚠️  Tentative de démarrage de MongoDB...${NC}"
    sudo systemctl start mongod
    sleep 2
    if systemctl is-active --quiet mongod; then
        echo -e "${GREEN}✅ MongoDB démarré${NC}"
    else
        echo -e "${RED}❌ Impossible de démarrer MongoDB${NC}"
        echo -e "${YELLOW}Démarrez MongoDB manuellement: sudo systemctl start mongod${NC}"
    fi
fi

# Installation PM2 si non présent
echo -e "\n${YELLOW}[8/10]${NC} Vérification de PM2..."
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 non trouvé, installation...${NC}"
    sudo npm install -g pm2
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PM2 installé${NC}"
    else
        echo -e "${RED}❌ Erreur lors de l'installation de PM2${NC}"
    fi
else
    echo -e "${GREEN}✅ PM2 $(pm2 -v)${NC}"
fi

# Arrêter l'ancienne instance
echo -e "\n${YELLOW}[9/10]${NC} Arrêt de l'ancienne instance..."
pm2 stop vendia-pos 2>/dev/null || echo -e "${YELLOW}Aucune instance en cours${NC}"
pm2 delete vendia-pos 2>/dev/null

# Démarrer avec PM2
echo -e "\n${YELLOW}[10/10]${NC} Démarrage de l'application..."
if [ -f ecosystem.config.json ]; then
    pm2 start ecosystem.config.json
else
    pm2 start server.js --name vendia-pos
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application démarrée${NC}"
    
    # Configurer démarrage automatique
    pm2 save
    pm2 startup | tail -n 1 > pm2-startup.sh
    chmod +x pm2-startup.sh
    
    echo -e "\n${GREEN}=============================="
    echo -e "✅ Déploiement réussi !"
    echo -e "==============================${NC}"
    echo -e "\n📊 Status: pm2 status"
    echo -e "📝 Logs: pm2 logs vendia-pos"
    echo -e "🔄 Redémarrer: pm2 restart vendia-pos"
    echo -e "🛑 Arrêter: pm2 stop vendia-pos"
    echo -e "\n🌐 Application disponible sur: http://localhost:3000"
    
    # Afficher le status
    echo -e "\n"
    pm2 status
else
    echo -e "${RED}❌ Erreur lors du démarrage${NC}"
    exit 1
fi
