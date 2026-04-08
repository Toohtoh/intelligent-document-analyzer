@description('Location for all resources')
param location string = 'swedencentral'

@description('Unique suffix for resource names')
param suffix string

@description('Project name')
param projectName string = 'docanalyzer'

@description('Principal ID for role assignments')
param principalId string = ''

// ===== VARIABLES — NOMMAGE =====
var keyVaultName = 'kv-${projectName}-${suffix}'
var storageAccountName = 'st${projectName}${suffix}'
var acrName = 'acr${projectName}${suffix}'
var appServicePlanName = 'asp-${projectName}-${suffix}'
var appServiceName = 'app-${projectName}-${suffix}'
var cosmosAccountName = 'cosmos-${projectName}-${suffix}'
var logAnalyticsName = 'log-${projectName}-${suffix}'
var appInsightsName = 'appi-${projectName}-${suffix}'
var documentIntelligenceName = 'di-${projectName}-${suffix}'
var openAIName = 'oai-${projectName}-${suffix}'

// ===== MODULES =====

module keyVault 'modules/keyvault.bicep' = {
  name: 'keyVaultDeploy'
  params: {
    location: location
    keyVaultName: keyVaultName
    principalId: principalId
  }
}

module storage 'modules/storage.bicep' = {
  name: 'storageDeploy'
  params: {
    location: location
    storageAccountName: storageAccountName
  }
}

module acr 'modules/acr.bicep' = {
  name: 'acrDeploy'
  params: {
    location: location
    acrName: acrName
  }
}

module appService 'modules/appservice.bicep' = {
  name: 'appServiceDeploy'
  params: {
    location: location
    appServicePlanName: appServicePlanName
    appServiceName: appServiceName
    acrLoginServer: acr.outputs.acrLoginServer
  }
}

module cosmosDb 'modules/cosmosdb.bicep' = {
  name: 'cosmosDbDeploy'
  params: {
    location: location
    cosmosAccountName: cosmosAccountName
  }
}

module monitoring 'modules/monitoring.bicep' = {
  name: 'monitoringDeploy'
  params: {
    location: location
    logAnalyticsName: logAnalyticsName
    appInsightsName: appInsightsName
  }
}

module documentIntelligence 'modules/documentintelligence.bicep' = {
  name: 'documentIntelligenceDeploy'
  params: {
    location: location
    documentIntelligenceName: documentIntelligenceName
  }
}

// ===== OUTPUTS =====
output keyVaultName string = keyVault.outputs.keyVaultName
output keyVaultUri string = keyVault.outputs.keyVaultUri
output storageAccountName string = storage.outputs.storageAccountName
output blobEndpoint string = storage.outputs.blobEndpoint
output acrName string = acr.outputs.acrName
output acrLoginServer string = acr.outputs.acrLoginServer
output appServiceName string = appService.outputs.appServiceName
output appServiceUrl string = appService.outputs.appServiceUrl
output appServicePrincipalId string = appService.outputs.principalId
output cosmosEndpoint string = cosmosDb.outputs.cosmosEndpoint
output databaseName string = cosmosDb.outputs.databaseName
output appInsightsName string = monitoring.outputs.appInsightsName
output instrumentationKey string = monitoring.outputs.instrumentationKey
output appInsightsConnectionString string = monitoring.outputs.connectionString
output documentIntelligenceEndpoint string = documentIntelligence.outputs.documentIntelligenceEndpoint