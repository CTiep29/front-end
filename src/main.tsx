import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App';
import { Provider } from 'react-redux'
import { store } from '@/redux/store';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <GoogleOAuthProvider clientId="323789704789-fvlghj1e9ajvrt8n1gpv5gpmf77k36a4.apps.googleusercontent.com">
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>

    </React.StrictMode>,
  </GoogleOAuthProvider>
)
