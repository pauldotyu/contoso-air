# Contoso Air — Deployment

## Overview

| Field | Value |
|---|---|
| **App Name** | contoso-air |
| **Namespace** | ns687 |
| **Cluster** | aks-desktop35 |
| **Resource Group** | rg-desktop35 |
| **Container Registry** | acrdesktop35.azurecr.io |
| **Service Type** | ClusterIP |
| **Replicas** | 1 |

## Directory Structure

```
deploy/
├── kubernetes/
│   ├── deployment.yaml      # Kubernetes Deployment (1 replica, resource limits, probes)
│   ├── service.yaml         # ClusterIP Service (port 80 → 3000)
│   └── kustomization.yaml   # Kustomize manifest list
└── README.md                # This file
```

## Triggering the GitHub Actions Workflow

The deployment workflow is located at `.github/workflows/deploy-to-aks.yml` and is triggered **manually** via `workflow_dispatch`.

### Steps to trigger:

1. Navigate to the **Actions** tab in the GitHub repository.
2. Select **Deploy to AKS** from the workflow list.
3. Click **Run workflow**.
4. Fill in the inputs (defaults are pre-filled):
   - `cluster-name`: `aks-desktop35`
   - `resource-group`: `rg-desktop35`
   - `namespace`: `ns687`
5. Click **Run workflow** to start the deployment.

### What the workflow does:

1. Checks out the repository.
2. Authenticates to Azure using OIDC (federated credentials).
3. Sets the AKS context for `kubectl`.
4. Installs and configures `kubelogin` for AAD-enabled AKS.
5. Builds and pushes the container image to ACR using `az acr build`.
6. Updates the image reference in manifests to use the SHA-tagged ACR image.
7. Applies the Kubernetes manifests to namespace `ns687`.
8. Annotates deployments with pipeline run metadata.

### Required GitHub Secrets:

| Secret | Description |
|---|---|
| `AZURE_CLIENT_ID` | Azure Service Principal / Managed Identity client ID |
| `AZURE_TENANT_ID` | Azure Active Directory tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `AZURE_ACR_NAME` | ACR name (e.g., `acrdesktop35`) |

## Applying Manifests Manually

To apply the Kubernetes manifests manually:

```bash
# Authenticate to AKS
az aks get-credentials --resource-group rg-desktop35 --name aks-desktop35

# Apply all manifests
kubectl apply -f deploy/kubernetes/ -n ns687

# Check deployment status
kubectl rollout status deployment/contoso-air -n ns687

# Check pods
kubectl get pods -n ns687 -l app=contoso-air
```

## Dry-Run Validation

Validate manifests without applying:

```bash
kubectl apply --dry-run=client -f deploy/kubernetes/
```
