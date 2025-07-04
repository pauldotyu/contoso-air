terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.0.0, < 5.0.0"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

resource "azurerm_resource_group" "example" {
  name     = "rg-${var.environment}"
  location = var.location
}

module "avm-ptn-aks-dev" {
  source                 = "pauldotyu/avm-ptn-aks-dev/azurerm"
  version                = "0.1.1"
  name                   = var.environment
  location               = azurerm_resource_group.example.location
  resource_group_name    = azurerm_resource_group.example.name
  container_registry_sku = "Basic"
}
