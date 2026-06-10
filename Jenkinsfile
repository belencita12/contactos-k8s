pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "belencita12/contactos-backend:latest"
        FRONTEND_IMAGE = "belencita12/contactos-frontend:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Clonando repositorio...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Instalando dependencias del backend...'
                sh 'cd backend && npm install'
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Construyendo imagenes Docker...'
                sh 'docker build -t $BACKEND_IMAGE ./backend'
                sh 'docker build -t $FRONTEND_IMAGE ./frontend'
            }
        }

        stage('Push') {
            steps {
                echo 'Subiendo imagenes a Docker Hub...'
                sh 'docker push $BACKEND_IMAGE'
                sh 'docker push $FRONTEND_IMAGE'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Desplegando con Docker Compose...'
                sh 'docker-compose down || true'
                sh 'docker-compose up -d'
            }
        }

        stage('Verify') {
            steps {
                echo 'Verificando servicios...'
                sh 'docker-compose ps'
                sh 'sleep 5'
                sh 'curl -f http://localhost:3000/health || echo "Backend no responde aun"'
                sh 'curl -f http://localhost:3000/version'
            }
        }
    }

    post {
        success { echo 'Pipeline completado exitosamente.' }
        failure { echo 'Pipeline fallido. Revisar logs.' }
    }
}
