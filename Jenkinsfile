pipeline {
  agent any
  environment { SITE_DIR = '/site' }

  stages {
    stage('Checkout') { steps { checkout scm } }

    stage('Deploy') {
      steps {
        sh '''
          rm -rf ${SITE_DIR:?}/*
          cp -a . ${SITE_DIR}/
        '''
      }
    }
  }
}
