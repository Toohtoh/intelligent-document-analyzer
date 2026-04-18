import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import auth0Config from './auth0-config';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={auth0Config.authorizationParams}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

reportWebVitals();