"use client";

import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { useKalshiTheme } from "@kalshi-kit/react";

interface InstallCardProps {
  title?: string;
  language?: string;
  code: string;
}

/**
 * Code block with syntax highlighting (prism-react-renderer) and a copy
 * button. Used in the install section to surface the 3-line install/use story
 * in a screenshot-friendly card.
 */
export function InstallCard({ title, language, code }: InstallCardProps) {
  const [copied, setCopied] = useState(false);
  const theme = useKalshiTheme();
  const prismTheme = theme === "dark" ? themes.vsDark : themes.github;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in some contexts (insecure origin, restrictive
      // permissions); silently no-op rather than surfacing UI noise.
    }
  };

  // Map our shorthand language strings to Prism's. Unknown languages render
  // as plain text but the highlighter still tokenises whitespace correctly.
  const lang = mapLanguage(language);

  return (
    <div className="demo-install">
      <div className="demo-install__head">
        <span className="demo-install__title">{title ?? language ?? "code"}</span>
        <button
          type="button"
          className="demo-install__copy"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <Highlight code={code} language={lang} theme={prismTheme}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`demo-install__pre ${className}`}
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
  );
}

function mapLanguage(input: string | undefined): string {
  switch (input) {
    case "tsx":
    case "ts":
      return "tsx";
    case "js":
    case "jsx":
      return "jsx";
    case "bash":
    case "sh":
    case "shell":
      return "bash";
    default:
      return input ?? "text";
  }
}
