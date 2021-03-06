using VideoWeb.Common.Configuration;
using VideoWeb.Contract.Responses;

namespace VideoWeb.Mappings
{
    public static class ClientSettingsResponseMapper
    {
        public static ClientSettingsResponse MapAppConfigurationToResponseModel(AzureAdConfiguration azureAdConfiguration,
            HearingServicesConfiguration servicesConfiguration)
        {
            return new ClientSettingsResponse
            {
                ClientId = azureAdConfiguration.ClientId,
                TenantId = azureAdConfiguration.TenantId,
                RedirectUri = azureAdConfiguration.RedirectUri,
                PostLogoutRedirectUri = azureAdConfiguration.PostLogoutRedirectUri,
                VideoApiUrl = servicesConfiguration.VideoApiUrl,
                AppInsightsInstrumentationKey = azureAdConfiguration.ApplicationInsights.InstrumentationKey,
                EventHubPath = servicesConfiguration.EventHubPath
            };
        }

    }
}
