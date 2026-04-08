@description('Location for all resources')
param location string

@description('Azure OpenAI account name')
param openAIName string

resource openAI 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
  name: openAIName
  location: location
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
    }
    customSubDomainName: openAIName
    disableLocalAuth: false
  }
}

// Déploiement du modèle GPT-4o
resource gpt4oDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-10-01-preview' = {
  parent: openAI
  name: 'gpt-4o'
  sku: {
    name: 'Standard'
    capacity: 1
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-4o'
      version: '2024-11-20'
    }
    versionUpgradeOption: 'OnceCurrentVersionExpired'
  }
}

output openAIName string = openAI.name
output openAIEndpoint string = openAI.properties.endpoint
output openAIId string = openAI.id
output gpt4oDeploymentName string = gpt4oDeployment.name