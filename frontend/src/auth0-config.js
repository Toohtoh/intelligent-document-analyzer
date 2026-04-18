const auth0Config = {
  domain: "intelligent-docanalyzer.eu.auth0.com",
  clientId: "JzSC4hC5wuzaSidQ1GSkP048gTaoqSLy",
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: "https://docanalyzer-api",
  },
};

export default auth0Config;