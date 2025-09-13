# contoso-air

A sample airline booking application used for demos and learning purposes.

This repository is a revived and modernized version of the previously archived [microsoft/ContosoAir](https://github.com/microsoft/ContosoAir) demo project. This version has been rebuilt using using Next.js and TypeScript, and includes new features such as AI-powered virtual travel assistant.

To get started, follow the setup instructions below, which will guide you through configuring the necessary Azure resources and running the application
locally.

## Prerequisites

- Node.js 22.0.0 or later
- Azure CLI
- POSIX-compliant shell (bash or zsh)

## Getting Started

Clone the repository then run the following commands:

```bash

# install dependencies
npm install

# run the app
npm run dev
```

Browse to `http://localhost:3000` to see the app.

### Virtual Travel Assistant

To use the AI-powered virtual travel assistant, you have a few options:

1. Azure OpenAI Service
2. OpenAI API
3. Ollama

#### Azure OpenAI Service

To use Azure OpenAI Service, you need to create an Azure OpenAI resource and deploy a model. You can do this using the Azure CLI.

```bash
# create random resource identifier
RAND=$RANDOM
export RAND
echo "Random resource identifier will be: ${RAND}"

# set resource names
AZURE_RESOURCE_GROUP_NAME=rg-contosoair$RAND
AZURE_OPENAI_ACCOUNT_NAME=oai-contosoair$RAND

# choose a region that supports the model of your choice
AZURE_REGION=eastus2

# create resource group
az group create \
--name $AZURE_RESOURCE_GROUP_NAME \
--location $AZURE_REGION

# create openai account
AZURE_OPENAI_ACCOUNT_ID=$(az cognitiveservices account create \
--resource-group $AZURE_RESOURCE_GROUP_NAME \
--location $AZURE_REGION \
--name $AZURE_OPENAI_ACCOUNT_NAME \
--custom-domain $AZURE_OPENAI_ACCOUNT_NAME \
--kind OpenAI \
--sku S0 \
--assign-identity \
--query id -o tsv)

# deploy gpt-5-mini model
az cognitiveservices account deployment create \
-n $AZURE_OPENAI_ACCOUNT_NAME \
-g $AZURE_RESOURCE_GROUP_NAME \
--deployment-name gpt-5-mini \
--model-name gpt-5-mini \
--model-version 2025-08-07 \
--model-format OpenAI \
--sku-capacity 250 \
--sku-name GlobalStandard

# create managed identity
AZURE_OPENAI_IDENTITY_ID=$(az identity create \
--name oai-contosoair$RAND-id \
--resource-group $AZURE_RESOURCE_GROUP_NAME \
--query id -o tsv)

# get managed identity principal id
AZURE_OPENAI_IDENTITY_PRINCIPAL_ID=$(az identity show \
--ids $AZURE_OPENAI_IDENTITY_ID \
--query principalId \
-o tsv)

# assign role to managed identity
az role assignment create \
--role "Cognitive Services OpenAI Contributor" \
--assignee $AZURE_OPENAI_IDENTITY_PRINCIPAL_ID \
--scope $AZURE_OPENAI_ACCOUNT_ID

# assign role to your account too
az role assignment create \
--role "Cognitive Services OpenAI Contributor" \
--assignee $(az ad signed-in-user show --query id -o tsv) \
--scope $AZURE_OPENAI_ACCOUNT_ID
```

Set environment variables for the app to use.

```bash
cat <<EOF > .env.local
CHAT_PROVIDER=azure
AZURE_OPENAI_ENDPOINT=$(az cognitiveservices account show -n $AZURE_OPENAI_ACCOUNT_NAME -g $AZURE_RESOURCE_GROUP_NAME --query properties.endpoint -o tsv)
AZURE_OPENAI_CLIENTID=$(az identity show --ids $AZURE_OPENAI_IDENTITY_ID --query clientId -o tsv)
AZURE_OPENAI_DEPLOYMENT=gpt-5-mini
AZURE_OPENAI_API_VERSION=2024-12-01-preview
EOF
```

When done testing, you can delete the resource group and all resources in it with:

```bash
az group delete --name $AZURE_RESOURCE_GROUP_NAME --yes --no-wait
```

#### OpenAI API

To use the OpenAI API, you need to create an account and get an API key from [OpenAI](https://platform.openai.com/account/api-keys).

Set environment variables for the app to use.

```bash
cat <<EOF > .env.local
CHAT_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
EOF
```

#### Ollama

To use Ollama, you need to install the Ollama CLI and have an Ollama server running. You can find more information on the [Ollama website](https://ollama.com/docs/installation).

Download a model of your choice, for example:

```bash
ollama pull gpt-oss:20b
```

Set environment variables for the app to use.

```bash
cat <<EOF > .env.local
CHAT_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gpt-oss:20b
EOF
```
