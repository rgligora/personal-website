pipeline {
  agent any
  environment { SITE_DIR = '/site' }

  stages {
    stage('Checkout') { steps { checkout scm } }

    stage('Deploy') {
      steps {
        sh '''
          rm -rf ${SITE_DIR:?}/*
          rsync -a --delete ./ ${SITE_DIR}/
          docker compose -f ${WORKSPACE}/docker-compose.yml up -d personal-website
        '''
      }
    }
  }
}
