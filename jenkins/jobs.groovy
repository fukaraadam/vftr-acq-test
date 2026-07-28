def repositoryUrl = System.getenv('GIT_REPO_URL') ?: 'file:///repo'
def branchName = System.getenv('GIT_BRANCH') ?: 'tmp'
def gitCredentialsId = System.getenv('GIT_CREDENTIALS_ID') ?: ''

pipelineJob('vftr-playwright-tests') {
  description('Parametrik VFTR Playwright testleri. Bu job Jenkins Configuration as Code ile yonetilir.')
  disabled(false)

  definition {
    cpsScm {
      scm {
        git {
          remote {
            url(repositoryUrl)
            if (gitCredentialsId) {
              credentials(gitCredentialsId)
            }
          }
          branch("*/${branchName}")
        }
      }
      scriptPath('Jenkinsfile')
      lightweight(false)
    }
  }
}
