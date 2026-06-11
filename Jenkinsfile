pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "belencita12/contactos-backend:latest"
        FRONTEND_IMAGE = "belencita12/contactos-frontend:latest"
        DOCKER_CREDENTIALS = 'dockerhub-credentials' 
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
                echo 'Dependencias instaladas correctamente.'
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Construyendo imágenes Docker...'
                sh 'docker build -t $BACKEND_IMAGE ./backend'
                sh 'docker build -t $FRONTEND_IMAGE ./frontend'
                echo 'Imágenes construidas correctamente.'
            }
        }

        stage('Push') {
            steps {
                echo 'Subiendo imágenes a Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_CREDENTIALS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh 'docker push $BACKEND_IMAGE'
                    sh 'docker push $FRONTEND_IMAGE'
                    sh 'docker logout'
                }
                echo 'Imágenes publicadas en Docker Hub.'
            }
        }

        stage('Deploy') {
            input {
                message '¿Desplegar la nueva versión en producción?'
                ok 'Sí, desplegar ahora'
                parameters {
                    choice(
                        name: 'ENTORNO',
                        choices: ['produccion', 'staging'],
                        description: 'Seleccionar entorno de despliegue'
                    )
                }
            }
            steps {
                echo "Desplegando en entorno: ${ENTORNO}"

                echo 'Limpiando despliegue anterior...'
                sh 'docker-compose down --remove-orphans || true'

                echo 'Eliminando contenedores antiguos...'
                sh 'docker container prune -f || true'

                echo 'Desplegando nueva versión...'
                sh 'docker-compose up -d --force-recreate'

                echo 'Despliegue completado.'
            }
        }

        stage('Verify') {
            steps {
                echo 'Verificando servicios desplegados...'

                // Verificar contenedores activos (equivalente a pods activos en k8s)
                sh 'docker-compose ps'

                // Esperar que el backend esté disponible
                sh '''
                    echo "Esperando que el backend responda..."
                    for i in $(seq 1 10); do
                        STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")
                        if [ "$STATUS" = "200" ]; then
                            echo "Backend respondió con HTTP 200 - OK"
                            break
                        fi
                        echo "Intento $i: backend no disponible aún (HTTP $STATUS), esperando..."
                        sleep 5
                    done
                    if [ "$STATUS" != "200" ]; then
                        echo "ERROR: El backend no respondió después de 50 segundos"
                        exit 1
                    fi
                '''

                // Verificar endpoint /health
                sh 'curl -f http://localhost:3000/health && echo "✔ /health OK"'

                // Verificar endpoint /version
                sh 'curl -f http://localhost:3000/version && echo "✔ /version OK"'

                // Verificar que el frontend esté accesible
                sh 'curl -f http://localhost:8080 && echo "✔ Frontend OK"'

                // Verificar Prometheus
                sh 'curl -f http://localhost:9090/-/ready && echo "✔ Prometheus OK"'

                echo 'Todos los servicios están corriendo correctamente.'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completado exitosamente.'
        }
        failure {
            echo '❌ Pipeline fallido. Revisar logs para más detalles.'
            sh 'docker-compose ps || true'
            sh 'docker-compose logs --tail=50 || true'
        }
        always {
            echo 'Pipeline finalizado.'
        }
    }
}

