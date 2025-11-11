# 🚀 GUIDE DE DÉPLOIEMENT - Vendia POS

Ce guide vous accompagne étape par étape pour déployer Vendia POS en production.

---

## 📋 PRÉ-REQUIS

### Système
- **OS:** Ubuntu 20.04+ / Debian 10+ / CentOS 8+
- **RAM:** Minimum 2GB (4GB recommandé)
- **Disque:** 10GB minimum
- **CPU:** 1 core minimum (2+ recommandé)

### Logiciels requis
- **Node.js:** v14.0.0 ou supérieur
- **npm:** v6.0.0 ou supérieur
- **MongoDB:** v4.4 ou supérieur
- **PM2:** Gestionnaire de processus (optionnel mais recommandé)
- **Nginx:** Reverse proxy (pour production)

---

## 📥 INSTALLATION

### 1. Cloner le projet
```bash
git clone https://github.com/marina-keet/vendia.git
cd vendia
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration

#### A. Créer le fichier .env
```bash
cp .env.example .env
nano .env
```

Modifiez les valeurs suivantes :
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/vendia
SESSION_SECRET=votre_secret_super_securise_ici_minimum_32_caracteres
JWT_SECRET=votre_jwt_secret_super_securise_ici_minimum_32_caracteres
ALLOWED_ORIGINS=https://votre-domaine.com
```

#### B. Créer les dossiers nécessaires
```bash
mkdir -p logs receipts
```

---

## 🗄️ CONFIGURATION MONGODB

### Installation MongoDB (Ubuntu/Debian)
```bash
# Importer la clé GPG
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Ajouter le repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Installer MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Démarrer MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Vérifier le status
sudo systemctl status mongod
```

### Sécuriser MongoDB (IMPORTANT !)
```bash
# Connexion au shell MongoDB
mongosh

# Créer un utilisateur admin
use admin
db.createUser({
  user: "admin",
  pwd: "mot_de_passe_securise",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

# Créer un utilisateur pour l'application
use vendia
db.createUser({
  user: "vendia_user",
  pwd: "mot_de_passe_securise",
  roles: [ { role: "readWrite", db: "vendia" } ]
})

exit
```

Puis modifier `.env` :
```bash
MONGODB_URI=mongodb://vendia_user:mot_de_passe_securise@localhost:27017/vendia?authSource=vendia
```

---

## 🚀 DÉPLOIEMENT

### Méthode 1: Script automatique (Recommandé)
```bash
./deploy.sh
```

Ce script va :
- ✅ Vérifier les dépendances
- ✅ Créer le fichier .env si nécessaire
- ✅ Installer les modules npm
- ✅ Démarrer MongoDB
- ✅ Démarrer l'application avec PM2
- ✅ Configurer le démarrage automatique

### Méthode 2: Manuel avec PM2
```bash
# Installer PM2 globalement
sudo npm install -g pm2

# Démarrer l'application
pm2 start ecosystem.config.json

# Configurer démarrage automatique
pm2 startup
pm2 save
```

### Méthode 3: Systemd (sans PM2)
```bash
# Copier le service
sudo cp vendia.service /etc/systemd/system/

# Recharger systemd
sudo systemctl daemon-reload

# Activer et démarrer
sudo systemctl enable vendia
sudo systemctl start vendia

# Vérifier le status
sudo systemctl status vendia
```

---

## 🌐 CONFIGURATION NGINX (Reverse Proxy)

### Installation Nginx
```bash
sudo apt install nginx
```

### Configuration
Créer `/etc/nginx/sites-available/vendia` :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Redirection HTTP → HTTPS (après config SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache des assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Limite de taille upload
    client_max_body_size 10M;
}
```

Activer le site :
```bash
sudo ln -s /etc/nginx/sites-available/vendia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 CONFIGURATION SSL (HTTPS)

### Avec Let's Encrypt (Gratuit)
```bash
# Installer certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir certificat SSL
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

---

## 🔥 CONFIGURATION FIREWALL

```bash
# Installer UFW
sudo apt install ufw

# Autoriser SSH
sudo ufw allow OpenSSH

# Autoriser HTTP et HTTPS
sudo ufw allow 'Nginx Full'

# Activer le firewall
sudo ufw enable

# Vérifier le status
sudo ufw status
```

---

## 🏥 VÉRIFICATION DE SANTÉ

### Script de vérification
```bash
./health-check.sh
```

### Commandes utiles

#### Avec PM2
```bash
pm2 status              # Status de l'application
pm2 logs vendia-pos     # Voir les logs en temps réel
pm2 restart vendia-pos  # Redémarrer
pm2 stop vendia-pos     # Arrêter
pm2 delete vendia-pos   # Supprimer
pm2 monit               # Monitoring en temps réel
```

#### Avec Systemd
```bash
sudo systemctl status vendia   # Status
sudo journalctl -u vendia -f   # Logs en temps réel
sudo systemctl restart vendia  # Redémarrer
sudo systemctl stop vendia     # Arrêter
```

#### MongoDB
```bash
sudo systemctl status mongod   # Status MongoDB
mongosh                        # Shell MongoDB
```

---

## 📊 MONITORING

### Logs
```bash
# Application (PM2)
pm2 logs vendia-pos

# Application (Systemd)
sudo journalctl -u vendia -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Performance
```bash
# CPU et mémoire (PM2)
pm2 monit

# Disque
df -h

# Mémoire système
free -h

# Processus
htop
```

---

## 🔄 MISE À JOUR

```bash
# 1. Sauvegarder la base de données
mongodump --out ~/backup-$(date +%Y%m%d)

# 2. Arrêter l'application
pm2 stop vendia-pos

# 3. Mettre à jour le code
git pull origin main
npm install

# 4. Redémarrer
pm2 restart vendia-pos

# 5. Vérifier
pm2 logs vendia-pos
```

---

## 💾 SAUVEGARDE

### Script de backup automatique
Ajouter dans crontab :
```bash
crontab -e
```

Ajouter :
```bash
# Backup quotidien à 2h du matin
0 2 * * * /usr/bin/mongodump --out /home/backup/vendia-$(date +\%Y\%m\%d) --db vendia
```

---

## 🆘 DÉPANNAGE

### Le serveur ne démarre pas
```bash
# Vérifier les logs
pm2 logs vendia-pos --lines 50

# Vérifier le port
lsof -i:3000

# Tester la connexion MongoDB
mongosh --eval "db.version()"
```

### MongoDB ne se connecte pas
```bash
# Vérifier le service
sudo systemctl status mongod

# Redémarrer
sudo systemctl restart mongod

# Vérifier les logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Nginx erreur 502
```bash
# Vérifier que l'app tourne
pm2 status

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log

# Tester la config
sudo nginx -t
```

### Port déjà utilisé
```bash
# Trouver le processus
lsof -i:3000

# Tuer le processus
kill -9 [PID]

# Ou forcer
lsof -ti:3000 | xargs kill -9
```

---

## 📞 SUPPORT

- **Documentation complète:** `AUDIT_DEPLOYMENT.md`
- **Guide utilisateur:** `GUIDE_UTILISATEUR.md`
- **Schéma BDD:** `DATABASE_SCHEMA.md`

---

## ✅ CHECKLIST FINALE

Avant de mettre en production :

- [ ] Fichier `.env` configuré avec valeurs de production
- [ ] MongoDB sécurisé avec authentification
- [ ] Firewall configuré (UFW)
- [ ] Nginx installé et configuré
- [ ] SSL/HTTPS activé (Let's Encrypt)
- [ ] PM2 ou systemd configuré pour démarrage automatique
- [ ] Backup automatique configuré (crontab)
- [ ] Script health-check testé
- [ ] Logs accessibles et monitoring en place
- [ ] Test de charge effectué
- [ ] Documentation à jour

---

**🎉 Félicitations ! Votre application Vendia POS est maintenant déployée en production !**
