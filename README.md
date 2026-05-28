# Directorio de Contactos - Kubernetes Local

Aplicación multicapa desplegada en Kubernetes local para el proyecto de DevOps.

```txt
Usuario -> Frontend (Nginx) -> Backend (Node.js/Express) -> Base de datos (PostgreSQL)
```

## Estructura del proyecto

```txt
contactos-k8s/
├── backend/
│   ├── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── index.html
│   ├── nginx.conf
│   ├── Dockerfile
│   └── .dockerignore
├── k8s/
│   ├── 00-namespace.yaml
│   ├── 01-postgres-secret.yaml
│   ├── 02-postgres.yaml
│   ├── 03-backend-configmap.yaml
│   ├── 04-backend.yaml
│   └── 05-frontend.yaml
├── GUIA_EJECUCION.md
└── README.md
```

## Requisitos

- Docker
- kubectl
- Minikube
- Git o terminal equivalente

## Ejecución rápida

### 1. Iniciar Minikube

```bash
minikube start
kubectl get nodes
```

### 2. Usar el Docker interno de Minikube

Git Bash / Linux / macOS:

```bash
eval $(minikube docker-env)
```

PowerShell:

```powershell
minikube docker-env | Invoke-Expression
```

### 3. Construir imágenes

```bash
docker build -t contactos-backend:latest ./backend
docker build -t contactos-frontend:latest ./frontend
```

### 4. Aplicar manifiestos

```bash
kubectl apply -f k8s/
```

### 5. Verificar recursos

```bash
kubectl get pods -n devops-lab
kubectl get services -n devops-lab
kubectl get deployments -n devops-lab
```

### 6. Abrir la aplicación

```bash
minikube service frontend-service -n devops-lab
```

O abrir manualmente:

```bash
minikube ip
```

Luego entrar a:

```txt
http://<IP_DE_MINIKUBE>:30080
```

## Comunicación entre componentes

El frontend consume la API usando la ruta relativa:

```txt
/api
```

Nginx dentro del contenedor frontend redirige `/api/` hacia:

```txt
http://backend-service:3000/
```

De esta forma el backend puede quedarse como `ClusterIP`, accesible solo dentro del clúster.

## Endpoints del backend

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Verifica estado del backend |
| GET | `/contactos` | Lista contactos |
| GET | `/contactos?search=texto` | Busca contactos |
| GET | `/contactos/:id` | Obtiene un contacto |
| POST | `/contactos` | Crea contacto |
| DELETE | `/contactos/:id` | Elimina contacto |

## Escalado

```bash
kubectl scale deployment backend -n devops-lab --replicas=3
kubectl get pods -n devops-lab
```

## Resiliencia

```bash
kubectl get pods -n devops-lab
kubectl delete pod <nombre-del-pod-backend> -n devops-lab
kubectl get pods -n devops-lab -w
```

Kubernetes recrea automáticamente el pod porque el Deployment mantiene el número deseado de réplicas.

## Diagnóstico

Ver logs del backend:

```bash
kubectl logs -n devops-lab deployment/backend
```

Ver logs del frontend:

```bash
kubectl logs -n devops-lab deployment/frontend
```

Describir pod con problemas:

```bash
kubectl describe pod <nombre-del-pod> -n devops-lab
```

Ver eventos:

```bash
kubectl get events -n devops-lab --sort-by=.metadata.creationTimestamp
```

Probar backend desde dentro del clúster:

```bash
kubectl run test-curl -n devops-lab --rm -it --image=curlimages/curl -- sh
curl http://backend-service:3000/health
curl http://backend-service:3000/contactos
exit
```

## Limpieza

```bash
kubectl delete namespace devops-lab
```

Apagar Minikube:

```bash
minikube stop
```

## Evidencias recomendadas

Para el informe conviene capturar:

- Pods en estado `Running`.
- Services activos.
- Frontend funcionando en navegador.
- Contactos cargados desde la base de datos.
- Backend escalado a 3 réplicas.
- Eliminación de un pod y recreación automática.
- Logs del backend inicializando la base de datos.

Más detalle en `GUIA_EJECUCION.md`.
