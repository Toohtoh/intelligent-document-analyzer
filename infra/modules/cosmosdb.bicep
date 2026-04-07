@description('Location for all resources')
param location string

@description('Cosmos DB account name')
param cosmosAccountName string

@description('Database name')
param databaseName string = 'documentanalyzer'

// ===== COSMOS DB ACCOUNT =====
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2024-02-15-preview' = {
  name: cosmosAccountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    enableFreeTier: true // Free Tier — 1000 RU/s + 25 GB gratuits
    capacity: {
      totalThroughputLimit: 1000 // Limite budget étudiant
    }
    backupPolicy: {
      type: 'Continuous'
      continuousModeProperties: {
        tier: 'Continuous7Days'
      }
    }
    enableAnalyticalStorage: false
    publicNetworkAccess: 'Enabled'
  }
}

// ===== DATABASE =====
resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-02-15-preview' = {
  parent: cosmosAccount
  name: databaseName
  properties: {
    resource: {
      id: databaseName
    }
    options: {
      throughput: 400 // RU/s minimum — économique
    }
  }
}

// ===== CONTAINERS =====

// Container pour les documents analysés
resource documentsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-02-15-preview' = {
  parent: database
  name: 'documents'
  properties: {
    resource: {
      id: 'documents'
      partitionKey: {
        paths: ['/userId']
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        includedPaths: [{ path: '/*' }]
        excludedPaths: [{ path: '/_etag/?' }]
      }
    }
  }
}

// Container pour les résultats d'analyse
resource resultsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-02-15-preview' = {
  parent: database
  name: 'results'
  properties: {
    resource: {
      id: 'results'
      partitionKey: {
        paths: ['/documentId']
        kind: 'Hash'
      }
    }
  }
}

// ===== OUTPUTS =====
output cosmosAccountName string = cosmosAccount.name
output cosmosAccountId string = cosmosAccount.id
output cosmosEndpoint string = cosmosAccount.properties.documentEndpoint
output databaseName string = database.name