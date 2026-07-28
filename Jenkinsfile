pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    timeout(time: 90, unit: 'MINUTES')
    timestamps()
  }

  parameters {
    choice(
      name: 'TEST_TARGET',
      choices: [
        'ALL',
        'C2D_ALL',
        'MAIN_C2D',
        'SIMPLE_C2D',
        'AUTOMATIC_C2D',
        'EXAMPLE_ALL',
        'HAS_TITLE',
        'GET_STARTED_LINK',
      ],
      description: 'Calistirilacak test veya test grubu.',
    )
    choice(
      name: 'BROWSER',
      choices: ['chromium', 'firefox', 'webkit', 'all'],
      description: 'Playwright browser projesi. Varsayilan Chromium.',
    )
    string(
      name: 'TARIFF_ID',
      defaultValue: '',
      trim: true,
      description: 'Yalniz MAIN_C2D veya SIMPLE_C2D icin override. Bos birakilirsa test varsayilani kullanilir.',
    )
    string(
      name: 'MNP_NUMBER',
      defaultValue: '',
      trim: true,
      description: 'Ornek: 5555551125, 05555551125 veya (555) 555 11 25.',
    )
    booleanParam(
      name: 'RUN_DB_CHECK',
      defaultValue: false,
      description: 'Main C2D Oracle dogrulamasini Jenkins credentials ile calistir.',
    )
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Install dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Run Playwright tests') {
      steps {
        script {
          def testEnvironment = [
            "TEST_TARGET=${params.TEST_TARGET}",
            "BROWSER=${params.BROWSER}",
            "TARIFF_ID=${params.TARIFF_ID}",
            "MNP_NUMBER=${params.MNP_NUMBER}",
            "RUN_DB_CHECK=${params.RUN_DB_CHECK}",
          ]

          withEnv(testEnvironment) {
            if (params.RUN_DB_CHECK) {
              withCredentials([
                usernamePassword(
                  credentialsId: 'vftr-oracle-userpass',
                  usernameVariable: 'ORACLE_USER',
                  passwordVariable: 'ORACLE_PASSWORD',
                ),
                string(
                  credentialsId: 'vftr-oracle-connect-string',
                  variable: 'ORACLE_CONNECT_STRING',
                ),
              ]) {
                sh 'npm run test:ci'
              }
            } else {
              sh 'npm run test:ci'
            }
          }
        }
      }
    }
  }

  post {
    always {
      junit testResults: 'test-results/junit.xml', allowEmptyResults: true
      publishHTML(target: [
        reportName: 'Playwright HTML Report',
        reportDir: 'playwright-report',
        reportFiles: 'index.html',
        allowMissing: true,
        alwaysLinkToLastBuild: true,
        keepAll: true,
      ])
      archiveArtifacts(
        artifacts: 'playwright-report/**,test-results/**',
        allowEmptyArchive: true,
        fingerprint: false,
      )
    }
    cleanup {
      deleteDir()
    }
  }
}
