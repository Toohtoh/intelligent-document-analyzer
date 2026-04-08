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

output openAIName string = openAI.name
output openAIEndpoint string = openAI.properties.endpoint
output openAIId string = openAI.id
output gpt4oDeploymentName string = 'gpt-4o'