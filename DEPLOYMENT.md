# 🚀 Guide de Déploiement - Vendia POS (MySQL)

## Configuration MySQL pour le Déploiement

### 1️⃣ Installer et Configurer MySQL
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
sudo systemctl status mysql
```

### 2️⃣ Sécuriser MySQL
```bash
sudo mysql_secure_installation
```

### 3️⃣ Créer la base et l’utilisateur
```bash
sudo mysql -u root -p
CREATE DATABASE vendia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vendia_user'@'localhost' IDENTIFIED BY 'mot_de_passe_securise';
GRANT ALL PRIVILEGES ON vendia.* TO 'vendia_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4️⃣ Importer le schéma SQL
```bash
mysql -u vendia_user -p vendia < database/schema-mysql.sql
mysql -u vendia_user -p vendia < database/schema-mysql-products.sql
mysql -u vendia_user -p vendia < database/schema-mysql-customers.sql
mysql -u vendia_user -p vendia < database/schema-mysql-users.sql
mysql -u vendia_user -p vendia < database/schema-mysql-settings.sql
mysql -u vendia_user -p vendia < database/schema-mysql-reports.sql
```

### 5️⃣ Configuration du Fichier `.env`
```bash
cp .env.example .env
nano .env
```

**Variables à configurer :**
```env
NODE_ENV=production
PORT=3000
MYSQL_HOST=localhost
MYSQL_USER=vendia_user
MYSQL_PASSWORD=mot_de_passe_securise
MYSQL_DATABASE=vendia
SESSION_SECRET=votre_secret_session_tres_long_et_aleatoire_ici
JWT_SECRET=votre_secret_jwt_tres_long_et_aleatoire_ici
ALLOWED_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com
EXCHANGE_RATE=2450
```

### 6️⃣ Générer des Secrets Sécurisés
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
openssl rand -base64 64
```

### 7️⃣ Installation et Démarrage
```bash
git clone https://github.com/marina-keet/vendia.git
cd vendia
npm install
cp .env.example .env
nano .env
npm start
# Ou avec PM2 (recommandé pour production)
npm install -g pm2
pm2 start server.js --name vendia
pm2 save
pm2 startup
```

### 8️⃣ Vérification
```bash
curl http://localhost:3000
pm2 logs vendia
```

---

## 🔐 Sécurité en Production

### ⚠️ Points Importants

1. **NE JAMAIS committer `.env`** dans Git
   - Le fichier `.gitignore` l'exclut déjà
2. **Utiliser des secrets forts** :
   - Minimum 64 caractères aléatoires
   - Différents pour SESSION_SECRET et JWT_SECRET
3. **Configurer CORS** :
   - Limiter aux domaines autorisés uniquement
   - Ne pas utiliser `*` en production
4. **MySQL** :
   - Activer l'authentification
   - Utiliser des mots de passe complexes
   - Limiter l'accès réseau si possible
5. **Variables sensibles** :
   - Utiliser les variables d'environnement du serveur
   - Render.com : Settings → Environment
   - Heroku : Config Vars
   - VPS : Fichier `.env` avec permissions 600

---

## ☁️ Déploiement sur Différentes Plateformes

### Render.com
```bash
1. Créer un nouveau Web Service
2. Connecter votre repo GitHub
3. Ajouter les variables d'environnement dans Settings
4. Build Command: npm install
5. Start Command: npm start
```

### Heroku
```bash
heroku create vendia-pos
heroku config:set MYSQL_HOST="localhost"
heroku config:set MYSQL_USER="vendia_user"
heroku config:set MYSQL_PASSWORD="mot_de_passe_securise"
heroku config:set MYSQL_DATABASE="vendia"
heroku config:set SESSION_SECRET="votre_secret"
heroku config:set JWT_SECRET="votre_jwt_secret"
heroku config:set NODE_ENV="production"
git push heroku main
```

### VPS (Ubuntu)
```bash
# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudо apt-get install -y nodejs

# Configurer le projet (voir étapes ci-dessus)

# Utiliser PM2 pour la gestion des processus
npm install -g pm2
pm2 start server.js --name vendia
pm2 startup
pm2 save

# Configurer Nginx comme reverse proxy (optionnel)
sudo apt-get install nginx
# Configurer /etc/nginx/sites-available/vendia
```

---

## 📊 Variables d'Environnement Complètes

| Variable | Description | Exemple | Obligatoire |
|----------|-------------|---------|-------------|
| `NODE_ENV` | Environnement d'exécution | `production` | Oui |
| `PORT` | Port du serveur | `3000` | Non (défaut: 3000) |
| `MYSQL_HOST` | Hôte MySQL | `localhost` | Oui |
| `MYSQL_USER` | Utilisateur MySQL | `vendia_user` | Oui |
| `MYSQL_PASSWORD` | Mot de passe MySQL | `mot_de_passe_securise` | Oui |
| `MYSQL_DATABASE` | Base de données MySQL | `vendia` | Oui |
| `SESSION_SECRET` | Secret pour les sessions | `random_string_64_chars` | Oui |
| `JWT_SECRET` | Secret pour JWT | `another_random_64_chars` | Oui |
| `ALLOWED_ORIGINS` | Domaines CORS autorisés | `https://domain.com` | Non |
| `EXCHANGE_RATE` | Taux de change FC/USD | `2450` | Non (défaut: 2450) |

---

## 🆘 Dépannage

### Erreur de Connexion MySQL
```bash
# Vérifier les variables
echo $MYSQL_HOST $MYSQL_USER $MYSQL_PASSWORD $MYSQL_DATABASE

# Tester la connexion
mysql -u vendia_user -p -e "SHOW DATABASES;"

# Logs MySQL
sudo tail -f /var/log/mysql/error.log
```

### Variables d'Environnement Non Chargées
```bash
# Vérifier que dotenv est installé
npm list dotenv

# Vérifier le fichier .env existe
ls -la .env

# Tester le chargement
node -e "require('dotenv').config(); console.log(process.env.MYSQL_HOST)"
```

### Port Déjà Utilisé
```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans .env
PORT=8080
```

---

## ✅ Checklist de Déploiement

- [ ] MySQL installé, sécurisé et configuré
- [ ] Fichier `.env` créé avec toutes les variables
- [ ] Secrets générés (SESSION_SECRET, JWT_SECRET)
- [ ] `.env` dans `.gitignore`
- [ ] `npm install` exécuté
- [ ] Connexion MySQL testée
- [ ] Application démarrée avec succès
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Page de connexion accessible
- [ ] Test de création de vente

---


## 📞 Support

En cas de problème :
1. Vérifier les logs : `pm2 logs vendia` ou console
2. Tester chaque variable d'environnement
3. Vérifier la connexion MySQL
4. S'assurer que toutes les dépendances sont installées

**Bon déploiement MySQL ! 🚀**
