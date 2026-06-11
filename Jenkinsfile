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
        echo 'Limpiando despliegue anterior...'
        sh 'docker-compose down --remove-orphans || true'

        echo 'Eliminando contenedores antiguos...'
        sh 'docker container prune -f || true'

        echo 'Desplegando nueva versión...'
        sh 'docker-compose up -d --force-recreate'
    }
}

        stage('Verify') {
            steps {
            	echo 'Verificando servicios...'
            	sh 'docker-compose ps'
            	echo 'Todos los servicios están corriendo correctamente.'
           }
       }
    }

    post {
        success { echo 'Pipeline completado exitosamente.' }
        failure { echo 'Pipeline fallido. Revisar logs.' }
    }
}
