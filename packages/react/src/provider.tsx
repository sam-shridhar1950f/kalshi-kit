import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createClient,
  type KalshiClient,
  type KalshiClientConfig,
} from "./client";

export type KalshiTheme = "light" | "dark" | "system";
export type ResolvedKalshiTheme = "light" | "dark";

const KalshiContext = createContext<KalshiClient | null>(null);
const KalshiThemeContext = createContext<ResolvedKalshiTheme>("light");

export interface KalshiProviderProps extends KalshiClientConfig {
  /**
   * Provide a pre-built client to share with multiple providers / tests.
   * Overrides `baseUrl` and `fetchFn` if supplied.
   */
  client?: KalshiClient;
  /**
   * Visual theme. `"system"` (default) follows the user's OS via
   * `prefers-color-scheme`. `"light"` / `"dark"` force the kit theme without
   * affecting the rest of your app.
   */
  theme?: KalshiTheme;
  /**
   * When true, the provider renders `<>{children}</>` — no wrapping element,
   * no `data-kk-theme` attribute on a div. Theme detection still works through
   * the media query inside `styles.css`. Use when you want zero markup
   * overhead and are happy to let CSS drive the theme. Default false.
   */
  unstyled?: boolean;
  children: ReactNode;
}

function getSystemTheme(): ResolvedKalshiTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function useResolvedTheme(theme: KalshiTheme): ResolvedKalshiTheme {
  // SSR-safe: render the deterministic light theme on the first paint and
  // upgrade after mount. This prevents hydration mismatches when the OS
  // preference is "dark".
  const [resolved, setResolved] = useState<ResolvedKalshiTheme>("light");

  useEffect(() => {
    if (theme !== "system") {
      setResolved(theme);
      return;
    }
    setResolved(getSystemTheme());
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      setResolved(event.matches ? "dark" : "light");
    };
    // Safari <14 only supports addListener/removeListener.
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, [theme]);

  return resolved;
}

export function KalshiProvider({
  client: providedClient,
  baseUrl,
  fetchFn,
  theme = "system",
  unstyled = false,
  children,
}: KalshiProviderProps) {
  const client = useMemo(() => {
    if (providedClient) return providedClient;
    return createClient({ baseUrl, fetchFn });
  }, [providedClient, baseUrl, fetchFn]);

  const resolved = useResolvedTheme(theme);

  const body = (
    <KalshiContext.Provider value={client}>
      <KalshiThemeContext.Provider value={resolved}>
        {children}
      </KalshiThemeContext.Provider>
    </KalshiContext.Provider>
  );

  if (unstyled) {
    return body;
  }

  // The `kk-provider` class is unused by styles — it's just a stable hook for
  // consumer overrides. `data-kk-theme` here gates the dark-mode rules in
  // `styles.css` so every descendant `.kk` resolves consistently.
  return (
    <div className="kk-provider" data-kk-theme={resolved}>
      {body}
    </div>
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

/**
 * Returns the resolved theme ("light" or "dark") for the nearest
 * `<KalshiProvider>`. Outside a provider this is always "light".
 */
export function useKalshiTheme(): ResolvedKalshiTheme {
  return useContext(KalshiThemeContext);
}
