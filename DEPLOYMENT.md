# 🚀 Guide de Déploiement - Vendia POS

## Configuration MongoDB pour le Déploiement

### 1️⃣ Créer une Base de Données MongoDB

**Option A : MongoDB Atlas (Cloud - Recommandé)**
1. Allez sur [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un compte gratuit (M0 Sandbox - 512 MB)
3. Créez un nouveau cluster
4. Configurez les accès :
   - Ajoutez votre adresse IP ou `0.0.0.0/0` (pour tout autoriser)
   - Créez un utilisateur avec mot de passe
5. Copiez la chaîne de connexion :
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/vendia?retryWrites=true&w=majority
   ```

**Option B : MongoDB Local (Développement)**
```bash
# Installer MongoDB sur votre serveur
sudo apt-get install mongodb
sudo systemctl start mongodb
# URI: mongodb://localhost:27017/vendia
```

### 2️⃣ Configuration du Fichier `.env`

Copiez `.env.example` vers `.env` et configurez :

```bash
# Copier le fichier exemple
cp .env.example .env

# Éditer avec vos valeurs
nano .env
```

**Variables à configurer :**

```env
# Environment
NODE_ENV=production

# Serveur
PORT=3000

# Base de données MongoDB
# ⚠️ Remplacez par votre URI MongoDB Atlas ou local
MONGODB_URI=mongodb+srv://votre_user:votre_password@cluster0.xxxxx.mongodb.net/vendia

# Sécurité
# ⚠️ Générez des secrets longs et aléatoires en production
SESSION_SECRET=votre_secret_session_tres_long_et_aleatoire_ici
JWT_SECRET=votre_secret_jwt_tres_long_et_aleatoire_ici

# CORS
ALLOWED_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com

# Taux de change
EXCHANGE_RATE=2450
```

### 3️⃣ Générer des Secrets Sécurisés

```bash
# Générer un secret aléatoire (Linux/Mac)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Ou avec OpenSSL
openssl rand -base64 64
```

### 4️⃣ Installation et Démarrage

```bash
# 1. Cloner le projet
git clone https://github.com/marina-keet/vendia.git
cd vendia

# 2. Installer les dépendances
npm install

# 3. Configurer .env (voir étape 2)
cp .env.example .env
nano .env

# 4. Démarrer l'application
npm start

# Ou avec PM2 (recommandé pour production)
npm install -g pm2
pm2 start server.js --name vendia
pm2 save
pm2 startup
```

### 5️⃣ Vérification

```bash
# Tester la connexion
curl http://localhost:3000

# Vérifier les logs
pm2 logs vendia

# Ou avec npm start
# Les logs afficheront : "✅ MongoDB connecté avec succès!"
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

4. **MongoDB Atlas** :
   - Activer l'authentification
   - Limiter les IPs autorisées
   - Utiliser des mots de passe complexes

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
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set SESSION_SECRET="votre_secret"
heroku config:set JWT_SECRET="votre_jwt_secret"
heroku config:set NODE_ENV="production"
git push heroku main
```

### VPS (Ubuntu)
```bash
# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Configurer le projet (voir étape 4)

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
| `MONGODB_URI` | URI de connexion MongoDB | `mongodb+srv://...` | Oui |
| `SESSION_SECRET` | Secret pour les sessions | `random_string_64_chars` | Oui |
| `JWT_SECRET` | Secret pour JWT | `another_random_64_chars` | Oui |
| `ALLOWED_ORIGINS` | Domaines CORS autorisés | `https://domain.com` | Non |
| `EXCHANGE_RATE` | Taux de change FC/USD | `2450` | Non (défaut: 2450) |

---

## 🆘 Dépannage

### Erreur de Connexion MongoDB
```bash
# Vérifier l'URI
echo $MONGODB_URI

# Tester la connexion
mongo "mongodb+srv://cluster.xxxxx.mongodb.net/test" --username votre_user

# Logs MongoDB Atlas : onglet "Monitoring" dans Atlas
```

### Variables d'Environnement Non Chargées
```bash
# Vérifier que dotenv est installé
npm list dotenv

# Vérifier le fichier .env existe
ls -la .env

# Tester le chargement
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
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

- [ ] MongoDB Atlas créé et configuré
- [ ] Fichier `.env` créé avec toutes les variables
- [ ] Secrets générés (SESSION_SECRET, JWT_SECRET)
- [ ] `.env` dans `.gitignore`
- [ ] `npm install` exécuté
- [ ] Connexion MongoDB testée
- [ ] Application démarrée avec succès
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Page de connexion accessible
- [ ] Test de création de vente

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : `pm2 logs vendia` ou console
2. Tester chaque variable d'environnement
3. Vérifier la connexion MongoDB dans Atlas
4. S'assurer que toutes les dépendances sont installées

**Bon déploiement ! 🚀**
