import type { ReactNode } from "react";

interface SectionProps {
  kicker?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Consistent section: small uppercase kicker, large title, optional
 * description, then content. Used to chunk the marketing page.
 */
export function Section({ kicker, title, description, children }: SectionProps) {
  return (
    <section className="demo-section">
      <header className="demo-section__header">
        {kicker ? <span className="demo-section__kicker">{kicker}</span> : null}
        <h2 className="demo-section__title">{title}</h2>
        {description ? (
          <p className="demo-section__desc">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
