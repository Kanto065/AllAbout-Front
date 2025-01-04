import { useEffect } from 'react';

const InAppBrowserRedirect = () => {
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Detect common in-app browsers like Facebook and Instagram
    const isInAppBrowser = /FBAN|FBAV|Instagram|Line/i.test(userAgent);

    if (isInAppBrowser) {
      const currentUrl = window.location.href;

      if (/Android/i.test(userAgent)) {
        // Android: Trigger the intent to show all available browsers
        window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;end`;
      } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        // iOS: Show alert to open in Safari or another secure browser
        alert("Please open this link in Safari or a secure browser.");
      }
    }
  }, []);

  return null;
};

export default InAppBrowserRedirect;
