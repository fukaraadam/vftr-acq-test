import com.cloudbees.plugins.credentials.CredentialsScope
import com.cloudbees.plugins.credentials.SystemCredentialsProvider
import com.cloudbees.plugins.credentials.domains.Domain
import com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl
import hudson.model.Node
import hudson.slaves.DumbSlave
import hudson.slaves.JNLPLauncher
import hudson.slaves.RetentionStrategy
import hudson.util.Secret
import jenkins.model.Jenkins
import org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl

import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption

def jenkins = Jenkins.get()
def nodeName = System.getenv('JENKINS_AGENT_NAME') ?: 'playwright-agent'
def node = jenkins.getNode(nodeName)

if (node == null) {
  node = new DumbSlave(nodeName, '/home/jenkins/agent', new JNLPLauncher())
  node.setNodeDescription('Local Playwright test agent managed by init.groovy.d')
  node.setNumExecutors(1)
  node.setMode(Node.Mode.EXCLUSIVE)
  node.setLabelString('playwright')
  node.setRetentionStrategy(new RetentionStrategy.Always())
  jenkins.addNode(node)
  println("Created Jenkins node: ${nodeName}")
} else {
  node.setNumExecutors(1)
  node.setMode(Node.Mode.EXCLUSIVE)
  node.setLabelString('playwright')
  node.setLauncher(new JNLPLauncher())
  node.setRetentionStrategy(new RetentionStrategy.Always())
  node.save()
  println("Updated Jenkins node: ${nodeName}")
}

def computer = node.toComputer()
if (computer == null) {
  throw new IllegalStateException("Could not create computer for ${nodeName}")
}

Path secretDirectory = Paths.get('/run/jenkins-agent')
Path secretFile = secretDirectory.resolve('secret')
Path temporarySecretFile = secretDirectory.resolve('secret.tmp')
Files.createDirectories(secretDirectory)
Files.writeString(
  temporarySecretFile,
  computer.getJnlpMac(),
  StandardCharsets.UTF_8,
)
Files.move(
  temporarySecretFile,
  secretFile,
  StandardCopyOption.REPLACE_EXISTING,
  StandardCopyOption.ATOMIC_MOVE,
)
println("Updated inbound-agent secret for ${nodeName}")

def oracleUser = System.getenv('ORACLE_USER') ?: ''
def oraclePassword = System.getenv('ORACLE_PASSWORD') ?: ''
def oracleConnectString = System.getenv('ORACLE_CONNECT_STRING') ?: ''

if (oracleUser && oraclePassword && oracleConnectString) {
  def credentialsProvider = SystemCredentialsProvider.getInstance()
  def credentialsStore = credentialsProvider.getStore()
  def globalDomain = Domain.global()

  def oracleUserPassword = new UsernamePasswordCredentialsImpl(
    CredentialsScope.GLOBAL,
    'vftr-oracle-userpass',
    'VFTR Oracle username/password for local Playwright tests',
    oracleUser,
    oraclePassword,
  )
  def oracleConnectStringCredential = new StringCredentialsImpl(
    CredentialsScope.GLOBAL,
    'vftr-oracle-connect-string',
    'VFTR Oracle connect string for local Playwright tests',
    Secret.fromString(oracleConnectString),
  )

  [oracleUserPassword, oracleConnectStringCredential].each { credential ->
    def existing = credentialsStore
      .getCredentials(globalDomain)
      .find { current -> current.id == credential.id }

    if (existing == null) {
      credentialsStore.addCredentials(globalDomain, credential)
      println("Created Jenkins credential: ${credential.id}")
    } else {
      credentialsStore.updateCredentials(globalDomain, existing, credential)
      println("Updated Jenkins credential: ${credential.id}")
    }
  }
} else {
  println('Oracle credentials were not configured; RUN_DB_CHECK remains optional.')
}
