#!/usr/bin/env bash
# deploy.sh — GitHub + Railway deployment for WC2026 Predictions

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# ── Helpers ───────────────────────────────────────────────────────────────────
step()    { echo -e "\n${BOLD}${CYAN}╔══ Step $1 ═══════════════════════════════════════╗${NC}"; \
            echo -e "${BOLD}${CYAN}║  $2${NC}"; \
            echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════╝${NC}"; }
ok()      { echo -e "  ${GREEN}✔  ${NC}$*"; }
warn()    { echo -e "  ${YELLOW}⚠  ${NC}$*"; }
info()    { echo -e "  ${BLUE}ℹ  ${NC}$*"; }
err()     { echo -e "  ${RED}✖  ${NC}$*" >&2; }
ask()     { echo -e "  ${YELLOW}?  ${BOLD}$1${NC}"; }
die()     { err "$1"; echo -e "\n${RED}${BOLD}Deployment aborted.${NC}\n"; exit 1; }

# ── Banner ────────────────────────────────────────────────────────────────────
echo -e ""
echo -e "${BOLD}${GREEN}  ╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}  ║   🏆  WC2026 Predictions — Deploy Script      ║${NC}"
echo -e "${BOLD}${GREEN}  ║       GitHub + Railway automated deploy        ║${NC}"
echo -e "${BOLD}${GREEN}  ╚═══════════════════════════════════════════════╝${NC}"
echo -e ""

# ── Guard: must run from project root ─────────────────────────────────────────
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
  die "Run this script from the project root (where package.json lives)."
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 — Git init
# ─────────────────────────────────────────────────────────────────────────────
step "1/9" "Git repository"

if [ ! -d ".git" ]; then
  warn "No git repository found. Initialising..."
  git init || die "git init failed."
  ok "Git repository initialised."
else
  ok "Git repository already initialised."
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 — GitHub remote URL
# ─────────────────────────────────────────────────────────────────────────────
step "2/9" "GitHub remote URL"

ask "Enter your GitHub repository URL:"
read -r REPO_URL

[ -z "$REPO_URL" ] && die "Repository URL cannot be empty."

# Basic sanity check — must look like a GitHub URL
if [[ ! "$REPO_URL" =~ github\.com ]]; then
  warn "URL doesn't look like a GitHub URL: $REPO_URL"
  ask "Continue anyway? (y/N)"
  read -r CONFIRM
  [[ "$CONFIRM" =~ ^[Yy]$ ]] || die "Aborted by user."
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 — Add or update remote origin
# ─────────────────────────────────────────────────────────────────────────────
step "3/9" "Configuring remote origin"

if git remote get-url origin &>/dev/null; then
  EXISTING_URL=$(git remote get-url origin)
  if [ "$EXISTING_URL" = "$REPO_URL" ]; then
    ok "Remote 'origin' already points to the correct URL."
  else
    warn "Remote 'origin' currently points to: ${DIM}$EXISTING_URL${NC}"
    info "Updating to: $REPO_URL"
    git remote set-url origin "$REPO_URL" || die "Failed to update remote URL."
    ok "Remote 'origin' updated."
  fi
else
  git remote add origin "$REPO_URL" || die "Failed to add remote."
  ok "Remote 'origin' added → $REPO_URL"
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4 — Stage, commit, and push
# ─────────────────────────────────────────────────────────────────────────────
step "4/9" "Commit & push to GitHub"

# Ensure we're on main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
if [ "$CURRENT_BRANCH" != "main" ]; then
  if [ -z "$CURRENT_BRANCH" ] || [ "$CURRENT_BRANCH" = "HEAD" ]; then
    info "No commits yet — will create initial commit on 'main'."
  else
    warn "Current branch is '${CURRENT_BRANCH}'. Renaming to 'main'..."
    git branch -M main || die "Failed to rename branch to main."
  fi
fi

git add .

if git diff --cached --quiet 2>/dev/null; then
  ok "Nothing new to commit — working tree is clean."
else
  info "Staged files:"
  git diff --cached --name-only | sed 's/^/       /'

  ask "Commit message [Update WC2026 app]:"
  read -r COMMIT_MSG
  COMMIT_MSG="${COMMIT_MSG:-Update WC2026 app}"

  git commit -m "$COMMIT_MSG" || die "git commit failed."
  ok "Committed: \"$COMMIT_MSG\""
fi

info "Pushing to GitHub (origin/main)..."
git push -u origin main || die "git push failed. Check your repo URL and permissions."
ok "Pushed to GitHub successfully."

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5 — Railway CLI
# ─────────────────────────────────────────────────────────────────────────────
step "5/9" "Railway CLI"

if command -v railway &>/dev/null; then
  RAILWAY_VERSION=$(railway --version 2>/dev/null || echo "unknown version")
  ok "Railway CLI found: ${DIM}$RAILWAY_VERSION${NC}"
else
  warn "Railway CLI not found. Installing via npm..."
  npm install -g @railway/cli || die "Failed to install Railway CLI. Try: sudo npm install -g @railway/cli"
  ok "Railway CLI installed: $(railway --version 2>/dev/null || echo 'ok')"
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 6 — Railway authentication
# ─────────────────────────────────────────────────────────────────────────────
step "6/9" "Railway authentication"

WHOAMI=$(railway whoami 2>/dev/null || true)

if [ -n "$WHOAMI" ] && [[ ! "$WHOAMI" =~ "not logged" ]] && [[ ! "$WHOAMI" =~ "Login" ]]; then
  ok "Logged in as: ${BOLD}$WHOAMI${NC}"
else
  warn "Not logged into Railway. Launching login..."
  railway login || die "Railway login failed."
  WHOAMI=$(railway whoami 2>/dev/null || true)
  ok "Logged in as: ${BOLD}$WHOAMI${NC}"
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 7 — Railway project link
# ─────────────────────────────────────────────────────────────────────────────
step "7/9" "Railway project link"

PROJECT_LINKED=false

# Railway CLI v3 stores link info in .railway/
if [ -d ".railway" ]; then
  PROJECT_LINKED=true
fi

# Also try `railway status` as a fallback check
if [ "$PROJECT_LINKED" = false ]; then
  if railway status &>/dev/null 2>&1; then
    PROJECT_LINKED=true
  fi
fi

if [ "$PROJECT_LINKED" = true ]; then
  STATUS_OUT=$(railway status 2>/dev/null || true)
  ok "Railway project already linked."
  [ -n "$STATUS_OUT" ] && echo -e "  ${DIM}$STATUS_OUT${NC}"
else
  warn "No Railway project linked."
  info "You'll be prompted to select an existing project or create a new one."
  railway link || die "Failed to link Railway project."
  ok "Project linked successfully."
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 8 — Deploy
# ─────────────────────────────────────────────────────────────────────────────
step "8/9" "Deploying to Railway"

info "Running railway up — this may take a minute..."
echo ""
railway up || die "Railway deployment failed. Run 'railway logs' to investigate."
echo ""
ok "Deployment complete."

# ─────────────────────────────────────────────────────────────────────────────
# STEP 9 — Fetch live URL
# ─────────────────────────────────────────────────────────────────────────────
step "9/9" "Fetching live URL"

DOMAIN_OUT=$(railway domain 2>/dev/null || true)
# Extract a URL from the output (handles both bare domain and https:// forms)
LIVE_URL=$(echo "$DOMAIN_OUT" | grep -Eo 'https?://[^ ]+' | head -1)
if [ -z "$LIVE_URL" ]; then
  # railway domain sometimes prints just the hostname without scheme
  LIVE_URL=$(echo "$DOMAIN_OUT" | grep -Eo '[a-zA-Z0-9-]+\.up\.railway\.app' | head -1)
  [ -n "$LIVE_URL" ] && LIVE_URL="https://$LIVE_URL"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Final success banner
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}  ╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}  ║   🎉  Deployment successful!                   ║${NC}"
if [ -n "$LIVE_URL" ]; then
echo -e "${BOLD}${GREEN}  ║                                                 ║${NC}"
echo -e "${BOLD}${GREEN}  ║   🌍  $LIVE_URL${NC}"
echo -e "${BOLD}${GREEN}  ║                                                 ║${NC}"
echo -e "${BOLD}${GREEN}  ║   Share this URL with your friends on any       ║${NC}"
echo -e "${BOLD}${GREEN}  ║   device — no LAN required!  ⚽                 ║${NC}"
else
echo -e "${BOLD}${GREEN}  ║                                                 ║${NC}"
echo -e "${BOLD}${GREEN}  ║   Run: railway domain  — to get your URL        ║${NC}"
echo -e "${BOLD}${GREEN}  ║   Or open the Railway dashboard to add one.     ║${NC}"
fi
echo -e "${BOLD}${GREEN}  ╚═══════════════════════════════════════════════╝${NC}"
echo ""
