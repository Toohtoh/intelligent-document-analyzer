@description('Location for all resources')
param location string

@description('Document Intelligence account name')
param documentIntelligenceName string

resource documentIntelligence 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
  name: documentIntelligenceName
  location: location
  kind: 'FormRecognizer'
  sku: {
    name: 'F0' // Free Tier — 500 pages/mois, 2 req/sec
  }
  properties: {
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
    }
    customSubDomainName: documentIntelligenceName
    disableLocalAuth: false
  }
}

output documentIntelligenceName string = documentIntelligence.name
output documentIntelligenceEndpoint string = documentIntelligence.properties.endpoint
output documentIntelligenceId string = documentIntelligence.id