@description('Location for all resources')
param location string = 'norwayeast'

@description('Unique suffix for resource names')
param suffix string

@description('Project name')
param projectName string = 'docanalyzer'

@description('Principal ID for role assignments (your Azure AD user)')
param principalId string = ''

// ===== VARIABLES =====
var keyVaultName = 'kv-${projectName}-${suffix}'
var storageAccountName = 'st${projectName}${suffix}'
var acrName = 'acr${projectName}${suffix}'

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

// ===== OUTPUTS =====
output keyVaultName string = keyVault.outputs.keyVaultName
output keyVaultUri string = keyVault.outputs.keyVaultUri
output storageAccountName string = storage.outputs.storageAccountName
output blobEndpoint string = storage.outputs.blobEndpoint
output acrName string = acr.outputs.acrName
output acrLoginServer string = acr.outputs.acrLoginServer