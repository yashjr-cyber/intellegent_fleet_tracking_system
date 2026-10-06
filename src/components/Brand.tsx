export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand${compact ? " brand--compact" : ""}`}>
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="M7 23.5 14.7 8l4.1 8.2L25 6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="23.5" r="2.2" fill="currentColor" />
          <circle cx="25" cy="6" r="2.2" fill="currentColor" />
          <circle cx="18.8" cy="16.2" r="2" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="brand__wordmark">
          wayfinder<span>mobility</span>
        </span>
      )}
    </div>
  );
}
