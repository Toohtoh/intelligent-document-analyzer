@description('Location for all resources')
param location string

@description('Log Analytics Workspace name')
param logAnalyticsName string

@description('Application Insights name')
param appInsightsName string

// ===== LOG ANALYTICS WORKSPACE =====
// Obligatoire comme backend pour Application Insights v2
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018' // Pay-as-you-go — premiers 5 Go/mois gratuits
    }
    retentionInDays: 30 // Rétention minimale pour économiser
    workspaceCapping: {
      dailyQuotaGb: 1 // Limite à 1 Go/jour — protection budget
    }
  }
}

// ===== APPLICATION INSIGHTS =====
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id // Lié au Log Analytics
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    RetentionInDays: 30
    SamplingPercentage: 100
  }
}

// ===== OUTPUTS =====
output appInsightsName string = appInsights.name
output appInsightsId string = appInsights.id
output instrumentationKey string = appInsights.properties.InstrumentationKey
output connectionString string = appInsights.properties.ConnectionString
output logAnalyticsId string = logAnalytics.id