export interface CategoryFilterProps {
  /** Currently selected category, or `null` for "All". */
  value: string | null;
  onChange: (next: string | null) => void;
  /** Override the list. Default ["Sports", "Politics", "Crypto", "Economics", "World", "Entertainment"]. */
  categories?: string[];
  /** Show an "All" pill that clears the filter. Default true. */
  includeAllOption?: boolean;
  className?: string;
}

const DEFAULT_CATEGORIES = [
  "Sports",
  "Politics",
  "Crypto",
  "Economics",
  "World",
  "Entertainment",
];

export function CategoryFilter({
  value,
  onChange,
  categories = DEFAULT_CATEGORIES,
  includeAllOption = true,
  className,
}: CategoryFilterProps) {
  const rootClass = ["kk", "kk-cat-row", className].filter(Boolean).join(" ");

  function renderPill(label: string, pillValue: string | null) {
    const active = value === pillValue;
    const pillClass = [
      "kk-cat-pill",
      active ? "kk-cat-pill--active" : null,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <button
        key={pillValue ?? "__all__"}
        type="button"
        role="radio"
        className={pillClass}
        aria-checked={active}
        data-active={active ? "true" : undefined}
        onClick={() => onChange(pillValue)}
      >
        {label}
      </button>
    );
  }

  return (
    <div className={rootClass} role="radiogroup" aria-label="Category filter">
      {includeAllOption ? renderPill("All", null) : null}
      {categories.map((c) => renderPill(c, c))}
    </div>
  );
}
