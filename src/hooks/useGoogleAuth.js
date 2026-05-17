import { useEffect, useRef, useState } from 'react';

export const useGoogleAuth = (onSuccess, onError, buttonId) => {
  const initializedRef = useRef(false);
  const latestHandlersRef = useRef({ onSuccess, onError, buttonId });
  const [isReady, setIsReady] = useState(false);

  // Keep latest callbacks and button id without retriggering effects
  useEffect(() => {
    latestHandlersRef.current = { onSuccess, onError, buttonId };
  }, [onSuccess, onError, buttonId]);

  const initIfPossible = () => {
    if (initializedRef.current) return;
    if (typeof window === 'undefined') return;
    if (!window.google) return;
    const { buttonId: currentButtonId, onSuccess: successCb, onError: errorCb } = latestHandlersRef.current;
    if (!currentButtonId) return;

    initializedRef.current = true;
    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        auto_select: false,
        callback: (response) => {
          if (response && response.credential) {
            successCb(response.credential);
          } else {
            errorCb(new Error('No se recibió credencial de Google'));
          }
        }
      });

      const buttonElement = document.getElementById(currentButtonId);
      if (buttonElement && buttonElement.childNodes.length === 0) {
        window.google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: 340
        });
      }
      setIsReady(true);
    } catch (err) {
      // If something goes wrong, allow re-attempts
      initializedRef.current = false;
      throw err;
    }
  };

  // Load the script only once globally
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existing = document.getElementById('google-identity-services');
    if (existing) {
      if (window.google) initIfPossible();
      else existing.addEventListener('load', initIfPossible, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-identity-services';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', initIfPossible, { once: true });
    document.head.appendChild(script);

    // Do not remove the script on cleanup to keep it singleton across the app
    return () => {
      script.removeEventListener('load', initIfPossible);
    };
  }, []);

  // Attempt init again if button id appears later (e.g., after first render)
  useEffect(() => {
    if (buttonId && typeof window !== 'undefined' && window.google) {
      initIfPossible();
    }
  }, [buttonId]);

  return { isReady };
};