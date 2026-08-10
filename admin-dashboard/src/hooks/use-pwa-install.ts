import { useCallback, useEffect, useState } from 'react';

type UserChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<UserChoice>;
};

const isStandaloneMode = () => {
  const isMediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return isMediaStandalone || isIOSStandalone;
};

export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => isStandaloneMode());

  useEffect(() => {
    const displayModeMediaQuery = window.matchMedia('(display-mode: standalone)');

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleDisplayModeChange = () => {
      setIsInstalled(isStandaloneMode());
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (displayModeMediaQuery.addEventListener) {
      displayModeMediaQuery.addEventListener('change', handleDisplayModeChange);
    } else {
      displayModeMediaQuery.addListener(handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);

      if (displayModeMediaQuery.removeEventListener) {
        displayModeMediaQuery.removeEventListener('change', handleDisplayModeChange);
      } else {
        displayModeMediaQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      return false;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    return outcome === 'accepted';
  }, [deferredPrompt]);

  return {
    canInstall: Boolean(deferredPrompt) && !isInstalled,
    isInstalled,
    installApp,
  };
};
