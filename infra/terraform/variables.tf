variable "environment" {
  description = "The environment for which the resources are being created (e.g., dev, staging, prod)."
  type        = string
  default     = "dev"
}

variable "location" {
  description = "The Azure region where the resources will be created."
  type        = string
  default     = "East US"
}
