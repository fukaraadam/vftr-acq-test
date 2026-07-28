#!/usr/bin/env bash
set -Eeuo pipefail

secret_file="${JENKINS_SECRET_FILE:-/run/jenkins-agent/secret}"
agent_name="${JENKINS_AGENT_NAME:-playwright-agent}"
agent_workdir="${JENKINS_AGENT_WORKDIR:-/home/jenkins/agent}"
jenkins_url="${JENKINS_INTERNAL_URL:-http://jenkins:8080}"
agent_jar="${JENKINS_AGENT_JAR:-/tmp/agent.jar}"

mkdir -p "$agent_workdir"

until [[ -s "$secret_file" ]]; do
  echo "Waiting for Jenkins inbound-agent secret at $secret_file..."
  sleep 2
done

until curl --silent --show-error --fail \
  "${jenkins_url%/}/jnlpJars/agent.jar" \
  --output "$agent_jar"; do
  echo "Waiting to download agent.jar from Jenkins..."
  sleep 2
done

exec java -jar "$agent_jar" \
  -url "$jenkins_url" \
  -secret "$(<"$secret_file")" \
  -name "$agent_name" \
  -webSocket \
  -workDir "$agent_workdir"
