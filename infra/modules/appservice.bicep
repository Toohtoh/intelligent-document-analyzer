@description('Location for all resources')
param location string

@description('App Service Plan name')
param appServicePlanName string

@description('App Service (Web App) name')
param appServiceName string

@description('Azure Container Registry login server')
param acrLoginServer string

@description('Container image name')
param containerImageName string = 'backend:latest'

// ===== APP SERVICE PLAN =====
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true // Obligatoire pour Linux
  }
}

// ===== APP SERVICE (WEB APP) =====
resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: appServiceName
  location: location
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned' // Managed Identity — zéro secret pour ACR et Key Vault
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acrLoginServer}/${containerImageName}'
      alwaysOn: true
      http20Enabled: true
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${acrLoginServer}'
        }
        {
          name: 'WEBSITES_PORT'
          value: '8000' // Port FastAPI
        }
      ]
    }
  }
}

// ===== OUTPUTS =====
output appServiceName string = appService.name
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output appServicePlanId string = appServicePlan.id
output principalId string = appService.identity.principalId // Managed Identity ID