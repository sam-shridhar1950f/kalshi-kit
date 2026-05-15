"use client";

import { useState } from "react";

interface InstallCardProps {
  title?: string;
  language?: string;
  code: string;
}

/**
 * Code block with a copy button. Used in the install section to surface the
 * 3-line install/use story in a screenshot-friendly card.
 */
export function InstallCard({ title, language, code }: InstallCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in some contexts (e.g. insecure origin); we
      // silently no-op rather than throwing or surfacing UI noise.
    }
  };

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
      <pre className="demo-install__pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
