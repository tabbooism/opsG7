#!/usr/bin/env bash
# Signal Archive Cloudflare Tunnel installer.
# Prompts locally for credentials; secrets are not written to the repository or echoed to the terminal.
set -Eeuo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${SIGNAL_ARCHIVE_PORT:-8080}"
SERVICE_NAME="red-team-ops-coordinator"
DRY_RUN=false
NO_SERVICE=false

for argument in "$@"; do
  case "$argument" in
    --dry-run) DRY_RUN=true ;;
    --no-service) NO_SERVICE=true ;;
    --help)
      cat <<'USAGE'
Usage: bash scripts/deploy-cloudflare.sh [--dry-run] [--no-service]

Builds this repository, creates a remotely managed Cloudflare Tunnel and DNS route,
then optionally installs localhost-only application and cloudflared system services.

--dry-run     Validate prerequisites and show the requested inputs without changing Cloudflare or system services.
--no-service  Configure Cloudflare and build files, but do not install system services.
USAGE
      exit 0 ;;
    *) echo "Unknown option: $argument" >&2; exit 64 ;;
  esac
done

say() { printf '\n==> %s\n' "$*"; }
fail() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }
require() { command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"; }
prompt() { local __target="$1" message="$2" default_value="${3:-}" value; read -r -p "$message${default_value:+ [$default_value]}: " value; printf -v "$__target" '%s' "${value:-$default_value}"; }
prompt_secret() { local __target="$1" message="$2" value; read -r -s -p "$message: " value; printf '\n'; printf -v "$__target" '%s' "$value"; }
valid_identifier() { [[ "$1" =~ ^[A-Za-z0-9_-]+$ ]]; }
valid_hostname_label() { [[ "$1" =~ ^[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?$ ]]; }
valid_domain() { [[ "$1" =~ ^[A-Za-z0-9.-]+$ ]] && [[ "$1" == *.* ]]; }
run() { if "$DRY_RUN"; then printf '[dry-run] '; printf '%q ' "$@"; printf '\n'; else "$@"; fi; }

require curl
require node
require pnpm

say "Signal Archive / Cloudflare Tunnel deployment"
printf '%s\n' "This workflow creates a Cloudflare-managed HTTPS route to a localhost-only static server."
printf '%s\n' "It requires a Cloudflare API token with Account Tunnel Edit and Zone DNS Edit permissions."
printf '%s\n' "Use an API token rather than a legacy global API key. An account email is collected only as deployment metadata and is not transmitted by this script."

prompt CLOUDFLARE_EMAIL "Cloudflare account email (metadata only; optional)"
prompt CLOUDFLARE_ACCOUNT_ID "Cloudflare account ID"
prompt CLOUDFLARE_ZONE_ID "Cloudflare zone ID"
prompt DOMAIN "Base domain" "cloutscape.org"
prompt HOST_LABEL "Public hostname label (use @ for apex)" "ops"
prompt TUNNEL_MODE "Tunnel mode: create or existing" "create"
prompt TUNNEL_NAME "Tunnel name" "signal-archive-ops"
prompt_secret CLOUDFLARE_API_TOKEN "Cloudflare API token"

[[ -n "$CLOUDFLARE_ACCOUNT_ID" ]] && valid_identifier "$CLOUDFLARE_ACCOUNT_ID" || fail "Cloudflare account ID must be supplied."
[[ -n "$CLOUDFLARE_ZONE_ID" ]] && valid_identifier "$CLOUDFLARE_ZONE_ID" || fail "Cloudflare zone ID must be supplied."
valid_domain "$DOMAIN" || fail "Base domain must be a valid DNS name."
[[ "$HOST_LABEL" == "@" ]] || valid_hostname_label "$HOST_LABEL" || fail "Hostname label may contain letters, digits, and dashes, or use @."
[[ "$TUNNEL_MODE" == "create" || "$TUNNEL_MODE" == "existing" ]] || fail "Tunnel mode must be create or existing."
valid_identifier "$TUNNEL_NAME" || fail "Tunnel name may contain letters, digits, dashes, and underscores."
[[ -n "$CLOUDFLARE_API_TOKEN" ]] || fail "A Cloudflare API token is required for automatic tunnel and DNS setup."

if [[ "$TUNNEL_MODE" == "existing" ]]; then
  prompt TUNNEL_ID "Existing Cloudflare Tunnel ID"
  prompt_secret TUNNEL_TOKEN "Cloudflared tunnel token"
  valid_identifier "$TUNNEL_ID" || fail "Existing tunnel ID must be supplied."
  [[ -n "$TUNNEL_TOKEN" ]] || fail "A Cloudflared tunnel token is required for existing-tunnel service installation."
fi

PUBLIC_HOSTNAME="$DOMAIN"
if [[ "$HOST_LABEL" != "@" ]]; then PUBLIC_HOSTNAME="$HOST_LABEL.$DOMAIN"; fi

api() {
  local method="$1" path="$2" payload="${3:-}" response
  if [[ -n "$payload" ]]; then
    response="$(curl --fail-with-body --silent --show-error --request "$method" "https://api.cloudflare.com/client/v4$path" --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" --header "Content-Type: application/json" --data "$payload")"
  else
    response="$(curl --fail-with-body --silent --show-error --request "$method" "https://api.cloudflare.com/client/v4$path" --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN")"
  fi
  printf '%s' "$response"
}

say "Building local production files"
(cd "$ROOT_DIR" && run pnpm install --frozen-lockfile && run pnpm run plugins:validate && run pnpm run build)

if "$DRY_RUN"; then
  say "Dry-run summary"
  printf 'Would use %s tunnel "%s" and publish %s -> http://127.0.0.1:%s\n' "$TUNNEL_MODE" "$TUNNEL_NAME" "$PUBLIC_HOSTNAME" "$PORT"
  printf '%s\n' "No credentials, DNS records, or services were changed."
  exit 0
fi

if [[ "$TUNNEL_MODE" == "create" ]]; then
  say "Creating remotely managed Cloudflare Tunnel"
  TUNNEL_RESPONSE="$(api POST "/accounts/$CLOUDFLARE_ACCOUNT_ID/cfd_tunnel" "{\"name\":\"$TUNNEL_NAME\",\"config_src\":\"cloudflare\"}")" || fail "Tunnel creation request failed. Confirm token permissions and account ID."
  TUNNEL_ID="$(printf '%s' "$TUNNEL_RESPONSE" | node "$ROOT_DIR/scripts/json-field.mjs" --field result.id)" || fail "Cloudflare did not return a tunnel ID."
  TUNNEL_TOKEN="$(printf '%s' "$TUNNEL_RESPONSE" | node "$ROOT_DIR/scripts/json-field.mjs" --field result.token)" || fail "Cloudflare did not return a tunnel token."
else
  say "Using the supplied Cloudflared tunnel token"
fi

say "Configuring ingress for $PUBLIC_HOSTNAME"
INGRESS="{\"config\":{\"ingress\":[{\"hostname\":\"$PUBLIC_HOSTNAME\",\"service\":\"http://127.0.0.1:$PORT\",\"originRequest\":{}},{\"service\":\"http_status:404\"}]}}"
api PUT "/accounts/$CLOUDFLARE_ACCOUNT_ID/cfd_tunnel/$TUNNEL_ID/configurations" "$INGRESS" | node "$ROOT_DIR/scripts/json-field.mjs" --field success >/dev/null || fail "Tunnel ingress configuration failed."

say "Creating proxied DNS route for $PUBLIC_HOSTNAME"
DNS_PAYLOAD="{\"type\":\"CNAME\",\"proxied\":true,\"name\":\"$PUBLIC_HOSTNAME\",\"content\":\"$TUNNEL_ID.cfargotunnel.com\",\"ttl\":1}"
api POST "/zones/$CLOUDFLARE_ZONE_ID/dns_records" "$DNS_PAYLOAD" | node "$ROOT_DIR/scripts/json-field.mjs" --field success >/dev/null || fail "DNS record creation failed. Resolve any existing DNS conflict before retrying; this script will not overwrite records."

if "$NO_SERVICE"; then
  say "Cloudflare configuration completed"
  printf 'Tunnel: %s\nPublic hostname: https://%s\n' "$TUNNEL_ID" "$PUBLIC_HOSTNAME"
  printf '%s\n' "Run cloudflared manually with the tunnel token from the Cloudflare dashboard, or rerun without --no-service on a Linux host with sudo."
  exit 0
fi

if ! command -v cloudflared >/dev/null 2>&1; then
  say "Installing cloudflared from Cloudflare's Debian/Ubuntu package repository"
  require sudo
  run sudo mkdir -p --mode=0755 /usr/share/keyrings
  run bash -c "curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null"
  run bash -c "printf '%s\\n' 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list >/dev/null"
  run sudo apt-get update
  run sudo apt-get install -y cloudflared
fi

say "Installing local static-server system service"
require sudo
NODE_PATH="$(command -v node)"
UNIT_FILE="/tmp/$SERVICE_NAME.service"
cat > "$UNIT_FILE" <<UNIT
[Unit]
Description=Signal Archive static application
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=$ROOT_DIR
ExecStart=$NODE_PATH $ROOT_DIR/scripts/serve-static.mjs --host 127.0.0.1 --port $PORT
Restart=always
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=$ROOT_DIR

[Install]
WantedBy=multi-user.target
UNIT
run sudo install -m 0644 "$UNIT_FILE" "/etc/systemd/system/$SERVICE_NAME.service"
run sudo systemctl daemon-reload
run sudo systemctl enable --now "$SERVICE_NAME.service"

say "Installing Cloudflare Tunnel service"
if systemctl list-unit-files 2>/dev/null | grep -q '^cloudflared.service'; then
  read -r -p "An existing cloudflared service was found. Type REPLACE to update it with this tunnel token: " CONFIRM
  [[ "$CONFIRM" == "REPLACE" ]] || fail "Stopped without modifying the existing cloudflared service."
fi
run sudo cloudflared service install "$TUNNEL_TOKEN"
run sudo systemctl enable --now cloudflared

mkdir -p "$ROOT_DIR/.deploy"
cat > "$ROOT_DIR/.deploy/last-deploy.json" <<META
{"publicHostname":"$PUBLIC_HOSTNAME","tunnelId":"$TUNNEL_ID","port":$PORT,"deployedAt":"$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
META
chmod 700 "$ROOT_DIR/.deploy"
chmod 600 "$ROOT_DIR/.deploy/last-deploy.json"

say "Deployment completed"
printf 'Application: https://%s\n' "$PUBLIC_HOSTNAME"
printf 'Check application: sudo systemctl status %s\n' "$SERVICE_NAME"
printf 'Check tunnel:      sudo systemctl status cloudflared\n'
