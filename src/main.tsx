import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './i18n'

const cognitoAuthConfig = {
  authority:
    'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_EzynMLdtv',
  client_id: '1ekp541q11vbb85e4olec8295i',
  redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'openid email',
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
  <I18nProvider>
    <App />
  </I18nProvider>
</AuthProvider>
  </StrictMode>,
)