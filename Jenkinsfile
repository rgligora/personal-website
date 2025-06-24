pipeline {
  agent any

  stages {
    stage('Checkout') { steps { checkout scm } }

    stage('Deploy') {
      steps {
        sh '''
          rm -rf ${SITEDIR:?}/*
          rsync -a --delete ./ ${SITEDIR}/
          docker compose -f ${DOCKERDIR}/docker-compose.yml up -d personal-website
        '''
      }
    }
  }
}
