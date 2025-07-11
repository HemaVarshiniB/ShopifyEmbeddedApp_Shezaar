import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useOutletContext,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import createApp, { type ClientApplication, type AppBridgeState } from '@shopify/app-bridge';

export default function App() {
  const [appBridge, setAppBridge] = useState<ClientApplication<AppBridgeState> | null>(null);

  useEffect(() => {
    const host = new URLSearchParams(window.location.search).get('host');
    if (host) {
      const app = createApp({
        apiKey: '5c6356e9ba5b37253be43e796e0bef94', // Replace with your real one
        host,
        forceRedirect: true,
      });
      setAppBridge(app);
    }
  }, []);

  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={{ appBridge }} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
