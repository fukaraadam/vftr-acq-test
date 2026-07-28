#!/usr/bin/env bash
set -Eeuo pipefail

readonly script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly repo_dir="$(cd "${script_dir}/.." && pwd)"
readonly env_file="${repo_dir}/.env.jenkins"
readonly compose_file="${repo_dir}/docker-compose.yml"

log() {
  printf '[jenkins-bootstrap] %s\n' "$*"
}

fail() {
  printf '[jenkins-bootstrap] ERROR: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command is not installed: $1"
}

read_env_value() {
  local key="$1"
  awk -F= -v key="$key" '$1 == key { sub(/^[^=]*=/, ""); print; exit }' "$env_file"
}

ensure_env_value() {
  local key="$1"
  local value="$2"

  if ! grep -q "^${key}=" "$env_file"; then
    printf '%s=%s\n' "$key" "$value" >>"$env_file"
  fi
}

wait_for_http() {
  local url="$1"
  local attempts="${2:-90}"

  for ((attempt = 1; attempt <= attempts; attempt += 1)); do
    if curl --silent --fail --output /dev/null "$url"; then
      return 0
    fi
    sleep 2
  done

  return 1
}

require_command docker
require_command curl
require_command openssl
require_command git

docker compose version >/dev/null 2>&1 || fail 'Docker Compose v2 is required.'
docker info >/dev/null 2>&1 || fail 'Docker daemon is not accessible for the current user.'

if [[ ! -f "$env_file" ]]; then
  log 'Creating ignored .env.jenkins file.'
  umask 077
  : >"$env_file"
fi

current_branch="$(git -C "$repo_dir" branch --show-current 2>/dev/null || true)"
current_branch="${current_branch:-tmp}"

ensure_env_value JENKINS_ADMIN_ID admin
ensure_env_value JENKINS_ADMIN_PASSWORD "$(openssl rand -hex 24)"
ensure_env_value JENKINS_URL http://localhost:8088/
ensure_env_value JENKINS_AGENT_NAME playwright-agent
ensure_env_value GIT_REPO_URL file:///repo
ensure_env_value GIT_BRANCH "$current_branch"
ensure_env_value GIT_CREDENTIALS_ID ''
ensure_env_value ORACLE_USER ''
ensure_env_value ORACLE_PASSWORD ''
ensure_env_value ORACLE_CONNECT_STRING ''

chmod 600 "$env_file"

readonly jenkins_admin_id="$(read_env_value JENKINS_ADMIN_ID)"
readonly jenkins_admin_password="$(read_env_value JENKINS_ADMIN_PASSWORD)"
readonly jenkins_url="$(read_env_value JENKINS_URL)"
readonly agent_name="$(read_env_value JENKINS_AGENT_NAME)"
readonly compose=(docker compose --env-file "$env_file" --file "$compose_file")

[[ -n "$jenkins_admin_id" ]] || fail 'JENKINS_ADMIN_ID cannot be empty.'
[[ -n "$jenkins_admin_password" ]] || fail 'JENKINS_ADMIN_PASSWORD cannot be empty.'
[[ -n "$jenkins_url" ]] || fail 'JENKINS_URL cannot be empty.'
[[ -n "$agent_name" ]] || fail 'JENKINS_AGENT_NAME cannot be empty.'

if ! git -C "$repo_dir" ls-files --error-unmatch Jenkinsfile >/dev/null 2>&1 \
  || ! git -C "$repo_dir" diff --quiet HEAD -- Jenkinsfile; then
  log 'WARNING: local file:///repo checkout only sees committed Jenkinsfile content.'
fi

log 'Stopping local Jenkins services while preserving named volumes.'
"${compose[@]}" stop playwright-agent jenkins >/dev/null 2>&1 || true

log 'Installing or updating Jenkins plugins in the persistent Jenkins home.'
"${compose[@]}" run --rm plugin-init

log 'Building the dedicated Playwright Jenkins agent.'
"${compose[@]}" build playwright-agent

log 'Starting the official Jenkins controller.'
"${compose[@]}" up --detach --no-deps jenkins

wait_for_http "${jenkins_url%/}/login" 90 \
  || fail "Jenkins did not become ready. Inspect logs with: ${compose[*]} logs jenkins"

log 'Starting the Playwright agent.'
"${compose[@]}" up --detach --no-deps playwright-agent

agent_api="${jenkins_url%/}/computer/${agent_name}/api/json?tree=offline"
for ((attempt = 1; attempt <= 60; attempt += 1)); do
  agent_state="$(
    curl --silent --fail \
      --user "${jenkins_admin_id}:${jenkins_admin_password}" \
      "$agent_api" 2>/dev/null || true
  )"

  if grep -q '"offline"[[:space:]]*:[[:space:]]*false' <<<"$agent_state"; then
    break
  fi

  if ((attempt == 60)); then
    fail "Playwright agent did not come online. Inspect logs with: ${compose[*]} logs playwright-agent"
  fi

  sleep 2
done

job_api="${jenkins_url%/}/job/vftr-playwright-tests/api/json"
curl --silent --fail --output /dev/null \
  --user "${jenkins_admin_id}:${jenkins_admin_password}" \
  "$job_api" \
  || fail 'Jenkins started, but the vftr-playwright-tests job was not created.'

log 'Local Jenkins is ready.'
printf '\nJenkins URL: %s\nAdmin user: %s\nAdmin password: %s\nJob: vftr-playwright-tests\n' \
  "$jenkins_url" \
  "$jenkins_admin_id" \
  "$jenkins_admin_password"
