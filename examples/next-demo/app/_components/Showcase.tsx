"use client";

import { useState, type ReactNode } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { useKalshiTheme } from "@kalshi-kit/react";

interface ShowcaseProps {
  name: string;
  description?: string;
  code: string;
  language?: string;
  children: ReactNode;
  /** Wider render area for charts, orderbooks, etc. */
  wide?: boolean;
}

export function Showcase({
  name,
  description,
  code,
  language = "tsx",
  children,
  wide,
}: ShowcaseProps) {
  const [copied, setCopied] = useState(false);
  const theme = useKalshiTheme();
  const prismTheme = theme === "dark" ? themes.vsDark : themes.github;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard can fail on insecure origins; silently no-op */
    }
  };

  return (
    <section className={`demo-show${wide ? " demo-show--wide" : ""}`}>
      <header className="demo-show__head">
        <code className="demo-show__name">&lt;{name} /&gt;</code>
        {description ? (
          <p className="demo-show__desc">{description}</p>
        ) : null}
      </header>
      <div className="demo-show__grid">
        <div className="demo-show__render">{children}</div>
        <div className="demo-show__code">
          <button
            type="button"
            className="demo-show__copy"
            onClick={handleCopy}
            aria-label={`Copy ${name} code`}
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <Highlight code={code} language={language} theme={prismTheme}>
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className={`demo-show__pre ${className}`}
                style={{ ...style, background: "transparent" }}
              >
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      </div>
    </section>
  );
}
