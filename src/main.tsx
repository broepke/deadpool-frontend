import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from "react-oidc-context";
import type { User } from "oidc-client-ts";
import { WebStorageStateStore, Log } from "oidc-client-ts";
import App from './App';
import './index.css';

// Enable detailed logging
Log.setLogger(console);
Log.setLevel(Log.DEBUG);

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_DOMAIN,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  post_logout_redirect_uri: import.meta.env.VITE_COGNITO_LOGOUT_URI,
  response_type: "code",
  scope: "openid email profile",
  loadUserInfo: false,
  monitorSession: false,
  storeAuthStateInCookie: false,
  userStore: new WebStorageStateStore({
    store: window.localStorage,
    prefix: "cognito."
  }),
  onSigninCallback: (_user: User | void) => {
    console.log('Sign-in callback executed', {
      location: window.location.href,
      hasCode: new URLSearchParams(window.location.search).has('code'),
      hasError: new URLSearchParams(window.location.search).has('error'),
      hasState: new URLSearchParams(window.location.search).has('state'),
      timestamp: new Date().toISOString()
    });
    
    // Log any error parameters
    const params = new URLSearchParams(window.location.search);
    if (params.has('error')) {
      console.error('Auth Error:', {
        error: params.get('error'),
        errorDescription: params.get('error_description')
      });
    }
    
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  onSigninComplete: (user: User) => {
    console.log('Sign-in complete, user details:', {
      profile: user?.profile,
      scopes: user?.scope,
      idToken: user?.id_token ? 'Present' : 'Missing',
      accessToken: user?.access_token ? 'Present' : 'Missing',
      expiresAt: user?.expires_at,
      claims: Object.keys(user?.profile || {}),
      timestamp: new Date().toISOString()
    });

    // Force a state update
    window.dispatchEvent(new Event('auth_complete'));
  },
  onSigninError: (error: Error) => {
    console.error('Signin Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  },
  onSignoutError: (error: Error) => {
    console.error('Signout Error:', error);
  }
};

// Debug logging
console.log('Auth Config:', {
  authority: cognitoAuthConfig.authority,
  redirect_uri: cognitoAuthConfig.redirect_uri,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  scope: cognitoAuthConfig.scope
});

// Add global error handler for uncaught promise rejections
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
