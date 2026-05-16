# Backlog

Living list of things to do, ordered by impact. Not promises, just options.

## Near-term (next session-or-two of work)

- **Cut v0.1.2 of `@kalshi-kit/react` + `@kalshi-kit/next`.** The kit on npm is still 0.1.1, so external consumers do not yet have the ProbabilityDial YES/NO toggle, the TradeButton URL fix, the ShareCard `previewImage` prop, or the MarketCard `yes_sub_title` rendering. The demo renders these because it builds from local source, but `npm install @kalshi-kit/react` ships the old behavior. One bump + publish closes that gap.
- **Revoke the npm Granular Access Token that was pasted in chat.** Rotate it from the npm account UI, regenerate a fresh one if needed for CI.
- **Draft the launch tweet.** Pin to `@kalshi-kit/react` once posted. Include the OG-image-unfurled share URL for one of the hero markets.
- **Submit the "Build on Kalshi" grant application.** This is the actual reason the kit exists. Include the live demo link, the npm page, the GitHub repo, and the launch tweet (once it has any traction) in the application.

## Medium-term

- **Fumadocs (or alternative) docs site at `docs.kalshi-kit.dev`.** Today the only docs are the README plus `docs/theming.md`. Grant reviewers and external integrators will look for component-level reference docs. Fumadocs is the lightest fit for a Next.js monorepo; Mintlify is more polished but adds a vendor dependency.
- **Cloudscape-style composability refactors (Wave 2).** From the earlier audit: `asChild` escape hatches on primitives, render-prop variants on data components, fetch coalescing in the hooks, and a `<KalshiProvider>` API for swapping the data adapter. Pre-req for serious adopters.

## Long-shot / stretch ideas

- **Interactive-feeling Twitter share via attached video.** Render a 4-5s MP4 loop of the dial filling + prices ticking + trades scrolling for a given ticker, expose it at `/api/clip/market/{ticker}.mp4`, and have ShareCard attach it to the tweet via the Twitter media-upload API (after OAuth). Twitter inlines attached MP4s autoplay-on-scroll, which is the closest thing to "live dial in the timeline" that the platform still allows since Player Cards were closed to new domains in 2021. Cost: ~1-2 hrs for the clip endpoint (vercel/og frames → ffmpeg → mp4), ~1 hr more for the OAuth + attach flow. Not on the critical path for the grant.
- **Real-time WebSocket variant of `useMarket` / `useTradeFeed`.** Currently the hooks poll. Kalshi exposes a websocket feed for trades and book updates. Would meaningfully reduce request volume for any app that mounts more than a couple of components.
- **Tailwind preset / shadcn registry entry.** Lets users who already have Tailwind drop in the kit's CSS variables and components without our `styles.css` import.

## Won't-do (resolved or rejected)

- ~~Player Cards for richer in-tweet embeds~~ — Twitter no longer whitelists new domains. Dead end.
