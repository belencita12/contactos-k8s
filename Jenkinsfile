pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "contactos-backend:latest"
        FRONTEND_IMAGE = "contactos-frontend:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Clonando repositorio...'
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                echo 'Construyendo imagen del backend...'
                sh 'docker build -t $BACKEND_IMAGE ./backend'
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Construyendo imagen del frontend...'
                sh 'docker build -t $FRONTEND_IMAGE ./frontend'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Desplegando en Kubernetes...'
                sh 'kubectl apply -f k8s/'
                sh 'kubectl rollout restart deployment/backend -n devops-lab'
                sh 'kubectl rollout restart deployment/frontend -n devops-lab'
            }
        }

        stage('Verify') {
            steps {
                echo 'Verificando pods...'
                sh 'kubectl get pods -n devops-lab'
            }
        }
    }

    post {
        success { echo 'Pipeline completado exitosamente.' }
        failure { echo 'Pipeline fallido. Revisar logs.' }
    }
}


