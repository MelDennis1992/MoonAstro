#!/bin/bash
# =============================================
# 🚀 deploy.sh — MoonAstro Auto-Deploy
# Usage: ./deploy.sh "message de commit"
# =============================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🌙 MoonAstro — Déploiement vers Hostinger         ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "index.html" ]; then
  echo -e "${RED}❌ Erreur : Ce script doit être lancé depuis la racine du projet MoonAstro${NC}"
  exit 1
fi

# Message de commit (argument ou auto-généré)
COMMIT_MSG="${1:-"🔄 deploy: mise à jour automatique — $(date '+%d/%m/%Y %H:%M')"}"

echo -e "\n${YELLOW}📁 Statut Git actuel :${NC}"
git status --short

echo -e "\n${YELLOW}➕ Ajout de tous les fichiers modifiés...${NC}"
git add -A

# Vérifier s'il y a des changements à commiter
if git diff --cached --quiet; then
  echo -e "\n${YELLOW}⚠️  Aucun changement détecté — rien à déployer.${NC}"
  exit 0
fi

echo -e "\n${YELLOW}💾 Commit : ${COMMIT_MSG}${NC}"
git commit -m "$COMMIT_MSG"

echo -e "\n${YELLOW}🚀 Push vers GitHub (branche main)...${NC}"
git push origin main

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ Déploiement déclenché avec succès !              ${NC}"
echo -e "${GREEN}  🌐 Hostinger va déployer automatiquement sur :      ${NC}"
echo -e "${GREEN}     https://moonastro.life                           ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\n${BLUE}📊 Vérifiez le déploiement sur Hostinger :${NC}"
echo -e "   https://hpanel.hostinger.com/websites/moonastro.life/advanced/git\n"
