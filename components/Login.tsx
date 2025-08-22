
import React, { useEffect } from 'react';
import { CredentialResponse } from 'google-one-tap';
import { BookIcon } from './Icons';

// IMPORTANT: Replace with your actual Google Cloud Client ID
const GOOGLE_CLIENT_ID = "131172928015-mqn0urt4bnl26fev5abt96b2m1hb1sq1.apps.googleusercontent.com";

// Augment the Window interface to include the google object for TypeScript
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: CredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme: string;
              size: string;
              type: string;
              text: string;
            }
          ) => void;
        };
      };
    };
  }
}


interface LoginProps {
  onLoginSuccess: (credentialResponse: CredentialResponse) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: onLoginSuccess,
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button')!,
        { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with' }
      );
    } else {
        console.error("Google Identity Services script not loaded.");
    }
  }, [onLoginSuccess]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center">
        <div className="flex flex-col items-center">
            <BookIcon className="h-16 w-16 text-blue-500" />
            <h1 className="mt-4 text-4xl font-bold text-gray-800 dark:text-white">
                Teacher AI
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
                Your personal AI-powered tutor. Sign in to start learning.
            </p>
        </div>
        
        <div className="flex flex-col items-center justify-center pt-4">
             <div id="google-signin-button"></div>
             <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                By signing in, you agree to our terms of service.
             </p>
        </div>
        
         {GOOGLE_CLIENT_ID.startsWith("YOUR_GOOGLE_CLIENT_ID") && (
            <div className="mt-6 bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 text-left rounded-r-lg">
                <p className="font-bold">Developer Action Required</p>
                <p className="text-sm mt-1">
                    To enable Google Sign-In, you need to provide your own Google Client ID.
                </p>
                 <ol className="text-sm list-decimal list-inside mt-2 space-y-1">
                    <li>
                        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-yellow-900 dark:hover:text-yellow-100">
                           Create OAuth credentials
                        </a> in Google Cloud.
                    </li>
                    <li>
                        Copy the <strong>Client ID</strong>.
                    </li>
                    <li>
                        Paste it into the <code className="bg-yellow-200 dark:bg-yellow-800/50 font-mono text-xs px-1 py-0.5 rounded">GOOGLE_CLIENT_ID</code> variable in the <code className="bg-yellow-200 dark:bg-yellow-800/50 font-mono text-xs px-1 py-0.5 rounded">components/Login.tsx</code> file.
                    </li>
                </ol>
            </div>
        )}
      </div>
    </div>
  );
};

export default Login;
