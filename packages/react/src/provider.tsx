import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  createClient,
  type KalshiClient,
  type KalshiClientConfig,
} from "./client";

const KalshiContext = createContext<KalshiClient | null>(null);

export interface KalshiProviderProps extends KalshiClientConfig {
  /**
   * Provide a pre-built client to share with multiple providers / tests.
   * Overrides `baseUrl` and `fetchFn` if supplied.
   */
  client?: KalshiClient;
  children: ReactNode;
}

export function KalshiProvider({
  client: providedClient,
  baseUrl,
  fetchFn,
  children,
}: KalshiProviderProps) {
  const client = useMemo(() => {
    if (providedClient) return providedClient;
    return createClient({ baseUrl, fetchFn });
  }, [providedClient, baseUrl, fetchFn]);

  return (
    <KalshiContext.Provider value={client}>{children}</KalshiContext.Provider>
  );
}

let defaultClient: KalshiClient | null = null;
function getDefaultClient(): KalshiClient {
  if (!defaultClient) {
    defaultClient = createClient();
  }
  return defaultClient;
}

/**
 * Get the active Kalshi client. Works inside or outside `<KalshiProvider>`;
 * if no provider is present, returns a default client pointing at `/api/kalshi`.
 */
export function useKalshi(): KalshiClient {
  const ctx = useContext(KalshiContext);
  return ctx ?? getDefaultClient();
}
