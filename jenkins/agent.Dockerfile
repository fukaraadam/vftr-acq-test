FROM mcr.microsoft.com/playwright:v1.61.1-noble

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl git openjdk-21-jre-headless tini \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /home/jenkins/agent

COPY jenkins/agent-entrypoint.sh /usr/local/bin/playwright-jenkins-agent

RUN chmod 0755 /usr/local/bin/playwright-jenkins-agent

ENV JENKINS_AGENT_NAME=playwright-agent
ENV JENKINS_AGENT_WORKDIR=/home/jenkins/agent
ENV JENKINS_INTERNAL_URL=http://jenkins:8080
ENV JENKINS_SECRET_FILE=/run/jenkins-agent/secret

ENTRYPOINT ["tini", "--", "/usr/local/bin/playwright-jenkins-agent"]
