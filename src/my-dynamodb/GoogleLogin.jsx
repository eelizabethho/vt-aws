import { GoogleOAuthProvider, GoogleLogin as GoogleLoginButton } from '@react-oauth/google';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

/**
 * Drop this component anywhere in your app to show a Google sign-in button.
 *
 * Props:
 *   onSuccess(user) — called with { userId, email, name } after login
 *   onError()       — called if login fails
 */
export default function GoogleLogin({ onSuccess, onError }) {
  function handleSuccess(credentialResponse) {
    // Decode the JWT payload (no verification needed client-side, server verifies)
    const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
    onSuccess({
      userId: payload.sub,       // unique Google user ID
      email: payload.email,
      name: payload.name,
      credential: credentialResponse.credential, // send this to your server
    });
  }

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <GoogleLoginButton
        onSuccess={handleSuccess}
        onError={onError}
      />
    </GoogleOAuthProvider>
  );
}
