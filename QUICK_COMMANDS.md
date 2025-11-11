# ⚡ COMMANDES RAPIDES - Vendia POS

Guide de référence rapide pour les commandes les plus utilisées.

---

## 🚀 DÉMARRAGE

```bash
# Développement (avec auto-reload)
npm run dev

# Production (simple)
npm start

# Production (avec PM2)
pm2 start ecosystem.config.json
```

---

## 🔧 DÉVELOPPEMENT

```bash
# Installer dépendances
npm install

# Démarrer en mode dev
npm run dev

# Charger données de démo
npm run demo

# Afficher statistiques
npm run stats

# Nettoyer anciens reçus
npm run clean

# Réinitialiser BDD (ATTENTION!)
npm run reset
```

---

## 📊 MONITORING

```bash
# Status PM2
pm2 status

# Logs en temps réel
pm2 logs vendia-pos

# Logs des 50 dernières lignes
pm2 logs vendia-pos --lines 50

# Monitoring CPU/RAM
pm2 monit

# Vérifier santé système
./health-check.sh
```

---

## 🔄 GESTION PM2

```bash
# Démarrer
pm2 start server.js --name vendia-pos
# OU
pm2 start ecosystem.config.json

# Arrêter
pm2 stop vendia-pos

# Redémarrer
pm2 restart vendia-pos

# Supprimer
pm2 delete vendia-pos

# Sauvegarder config
pm2 save

# Configurer démarrage auto
pm2 startup
pm2 save

# Liste des processus
pm2 list

# Détails d'un processus
pm2 describe vendia-pos
```

---

## 🗄️ MONGODB

```bash
# Démarrer MongoDB
sudo systemctl start mongod

# Arrêter MongoDB
sudo systemctl stop mongod

# Redémarrer MongoDB
sudo systemctl restart mongod

# Status MongoDB
sudo systemctl status mongod

# Activer au démarrage
sudo systemctl enable mongod

# Shell MongoDB
mongosh

# Backup base de données
mongodump --out ~/backup-$(date +%Y%m%d) --db vendia

# Restaurer backup
mongorestore --db vendia ~/backup-20251111/vendia

# Voir les bases de données
mongosh --eval "show dbs"

# Voir les collections
mongosh vendia --eval "show collections"

# Compter les documents
mongosh vendia --eval "db.sales.countDocuments()"
```

---

## 🌐 NGINX

```bash
# Démarrer Nginx
sudo systemctl start nginx

# Arrêter Nginx
sudo systemctl stop nginx

# Redémarrer Nginx
sudo systemctl restart nginx

# Recharger config (sans interruption)
sudo systemctl reload nginx

# Tester config
sudo nginx -t

# Status
sudo systemctl status nginx

# Voir logs access
sudo tail -f /var/log/nginx/access.log

# Voir logs erreur
sudo tail -f /var/log/nginx/error.log
```

---

## 🔒 SSL/HTTPS

```bash
# Obtenir certificat SSL (Let's Encrypt)
sudo certbot --nginx -d votre-domaine.com

# Renouveler certificat
sudo certbot renew

# Test renouvellement
sudo certbot renew --dry-run

# Lister certificats
sudo certbot certificates
```

---

## 🔥 FIREWALL (UFW)

```bash
# Activer firewall
sudo ufw enable

# Désactiver firewall
sudo ufw disable

# Status
sudo ufw status

# Autoriser SSH
sudo ufw allow OpenSSH

# Autoriser HTTP
sudo ufw allow 80

# Autoriser HTTPS
sudo ufw allow 443

# Autoriser Nginx
sudo ufw allow 'Nginx Full'

# Supprimer règle
sudo ufw delete allow 80

# Réinitialiser
sudo ufw reset
```

---

## 🔍 DIAGNOSTIC

```bash
# Processus qui utilisent le port 3000
lsof -i:3000

# Tuer processus sur port 3000
lsof -ti:3000 | xargs kill -9

# Voir les processus Node.js
ps aux | grep node

# Usage disque
df -h

# Usage mémoire
free -h

# CPU et mémoire par processus
htop

# Tester connexion MongoDB
mongosh --eval "db.version()"

# Tester API
curl http://localhost:3000/api/reports/stats

# Tester avec headers
curl -i http://localhost:3000
```

---

## 📦 GIT

```bash
# Cloner le projet
git clone https://github.com/marina-keet/vendia.git

# Status
git status

# Ajouter fichiers
git add .

# Commit
git commit -m "Description du commit"

# Push
git push origin main

# Pull (récupérer mises à jour)
git pull origin main

# Voir historique
git log --oneline -10

# Créer branche
git checkout -b nouvelle-branche

# Changer de branche
git checkout main
```

---

## 💾 BACKUP

```bash
# Backup MongoDB
mongodump --out ~/backup-$(date +%Y%m%d) --db vendia

# Backup avec compression
mongodump --out ~/backup --db vendia --gzip

# Backup automatique (crontab)
crontab -e
# Ajouter: 0 2 * * * mongodump --out /home/backup/vendia-$(date +\%Y\%m\%d) --db vendia

# Restaurer backup
mongorestore --db vendia ~/backup-20251111/vendia

# Backup fichiers application
tar -czf vendia-backup-$(date +%Y%m%d).tar.gz /home/marina/vendia --exclude=node_modules
```

---

## 🔄 MISE À JOUR

```bash
# Sauvegarder BDD
mongodump --out ~/backup-$(date +%Y%m%d)

# Arrêter app
pm2 stop vendia-pos

# Récupérer code
git pull origin main

# Installer dépendances
npm install

# Redémarrer
pm2 restart vendia-pos

# Vérifier
pm2 logs vendia-pos --lines 20
```

---

## 🧪 TESTS

```bash
# Tester toutes les routes API
curl http://localhost:3000/api/reports/stats
curl http://localhost:3000/api/products
curl http://localhost:3000/api/sales
curl http://localhost:3000/api/customers

# Test de charge (nécessite loadtest)
npm install -g loadtest
loadtest -c 10 -n 100 http://localhost:3000

# Vérifier santé
./health-check.sh
```

---

## 📝 LOGS

```bash
# Logs PM2
pm2 logs vendia-pos

# Logs PM2 (dernières 50 lignes)
pm2 logs vendia-pos --lines 50

# Logs Nginx access
sudo tail -f /var/log/nginx/access.log

# Logs Nginx erreur
sudo tail -f /var/log/nginx/error.log

# Logs MongoDB
sudo tail -f /var/log/mongodb/mongod.log

# Logs système (si systemd)
sudo journalctl -u vendia -f

# Vider logs PM2
pm2 flush
```

---

## 🆘 DÉPANNAGE

```bash
# Serveur ne démarre pas
pm2 logs vendia-pos --lines 50
lsof -i:3000

# Port occupé
lsof -ti:3000 | xargs kill -9

# MongoDB ne se connecte pas
sudo systemctl status mongod
sudo systemctl restart mongod

# Nginx erreur 502
pm2 status
sudo nginx -t
sudo systemctl restart nginx

# Permissions fichiers
sudo chown -R $USER:$USER /home/marina/vendia
chmod -R 755 /home/marina/vendia

# Réinstaller node_modules
rm -rf node_modules package-lock.json
npm install

# Vérifier variable d'environnement
cat .env
echo $PORT
```

---

## 📊 STATISTIQUES

```bash
# Nombre de produits
mongosh vendia --eval "db.products.countDocuments()"

# Nombre de ventes
mongosh vendia --eval "db.sales.countDocuments()"

# Chiffre d'affaires total
mongosh vendia --eval "db.sales.aggregate([{$group:{_id:null,total:{$sum:'$finalAmount'}}}])"

# Dernières ventes
mongosh vendia --eval "db.sales.find().sort({createdAt:-1}).limit(5).pretty()"

# Stats système
npm run stats
```

---

## 🎯 UN COUP D'ŒIL

### Démarrage rapide
```bash
cd /home/marina/vendia
npm install
cp .env.example .env
npm start
```

### Déploiement production
```bash
./deploy.sh
```

### Monitoring
```bash
pm2 monit
```

### Backup
```bash
mongodump --out ~/backup-$(date +%Y%m%d) --db vendia
```

---

**💡 Astuce :** Créez des alias dans `~/.bashrc` pour les commandes fréquentes :

```bash
# Ajouter dans ~/.bashrc
alias vendia-start='cd ~/vendia && pm2 start ecosystem.config.json'
alias vendia-logs='pm2 logs vendia-pos'
alias vendia-restart='pm2 restart vendia-pos'
alias vendia-health='cd ~/vendia && ./health-check.sh'
alias vendia-backup='mongodump --out ~/backup-$(date +%Y%m%d) --db vendia'

# Recharger
source ~/.bashrc
```

Maintenant vous pouvez simplement taper `vendia-start`, `vendia-logs`, etc. ! 🚀
