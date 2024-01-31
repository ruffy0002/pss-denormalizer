# Express PSS Denormalizer

express-pss-denormalizer is an Express app that performs ETL (Extract, transform and load).

## Tools used

The ORM used to interact with MongoDB is Mongoose. The library used for type validation is ArkType.

## Endpoints

1. /health is the health route.
2. /api is the route for aggregating the data in MongoDB and populating the denormalised collection.

## General approach

- Use of streams in Node.js
- Cache using Map
    - All PSS submissions by organisation
    - Every organisation
- Every PSS is handled in the following manner,
    - async calls are awaited if required and data retrieved from MongoDB is cached.
    - Create denormalized PSS from map (cached data)
    - Insert denormalized PSS into collection

## Takeaways from past implementations

1. MongoDB Aggregation Pipeline limitations, including **result size limit**
2. Downsides to batch processing (awaiting many async calls at once)
    1. Delays the entire process
    2. May lead to **out of memory**
3. MongoDB
    1. Single threaded
    2. Read calls are **expensive**

## Docker support

This project is also containerised using a Dockerfile. Use Dockerfile.development for local development and you may mount your local working directory onto your container so container rebuild is not required. 

## Kubernetes support

Kubernetes resource files have also been added to support Kubernetes.

## Getting started

- .gitlab-ci.yml is configured to build, push to local docker registry, and deploy to local minikube cluster.
### Setup local cluster with Minikube

```bash
# https://minikube.sigs.k8s.io/docs/handbook/registry/
minikube start --insecure-registry "10.0.0.0/24"
minikube addons enable registry
docker run --rm -it --network=host alpine ash -c "apk add socat && socat TCP-LISTEN:5000,reuseaddr,fork TCP:$(minikube ip):5000"

# Set up environment variables for local Docker to use Docker daemon inside Minikube VM
eval $(minikube -p minikube docker-env)
```

### GitLab CI

<aside>
💡 MongoDB service is not required for express-pss-denormalizer pod to startup.

</aside>

```bash
# You will need the gitlab-runner CLI tool
# if you want to test the CI locally

# Run the build stage
gitlab-runner exec shell build

# Run the push stage
gitlab-runner exec shell push

# Run the deploy stage
# Apply secrets from env, apply deployment and service in the deploy stage
gitlab-runner exec shell deploy
```