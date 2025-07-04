output "AZURE_AKS_CLUSTER_NAME" {
  value = module.avm-ptn-aks-dev.kubernetes_cluster_name
}

output "AZURE_CONTAINER_REGISTRY_ENDPOINT" {
  value = module.avm-ptn-aks-dev.container_registry_login_server
}
