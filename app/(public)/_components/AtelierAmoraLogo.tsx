type AtelierAmoraLogoProps = {
  compact?: boolean;
  className?: string;
};

export function AtelierAmoraLogo({ compact = false, className }: AtelierAmoraLogoProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-center gap-4">
        <svg
          width={compact ? 34 : 56}
          height={compact ? 34 : 56}
          viewBox="0 0 56 56"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <defs>
            <linearGradient id="amora-arch" x1="12" y1="10" x2="44" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C68E5A" />
              <stop offset="1" stopColor="#9C6D82" />
            </linearGradient>
          </defs>
          <path
            d="M28 8C18.7 8 11 15.7 11 25V48H19V25C19 20 23 16 28 16C33 16 37 20 37 25V48H45V25C45 15.7 37.3 8 28 8Z"
            fill="url(#amora-arch)"
          />
          <path
            d="M28 26C25.8 24.1 22.5 24.4 20.7 26.6C18.9 28.8 19.3 32.1 21.5 33.8L28 39.2L34.5 33.8C36.7 32.1 37.1 28.8 35.3 26.6C33.5 24.4 30.2 24.1 28 26Z"
            fill="#2F1E2E"
          />
          <path
            d="M8 26C5.8 28.6 5.8 32.4 8 35M48 26C50.2 28.6 50.2 32.4 48 35"
            stroke="#C68E5A"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.45"
          />
          <circle cx="28" cy="12.5" r="1.8" fill="#C68E5A" />
        </svg>

        <div className="text-left">
          <p className="font-serif-display text-[0.72rem] uppercase tracking-[0.42em] text-[var(--color-secondary)]">
            Atelier
          </p>
          <p className="font-serif-display text-2xl uppercase leading-none tracking-[0.18em] text-[var(--color-text-primary)] sm:text-3xl">
            Amora
          </p>
        </div>
      </div>
    </div>
  );
}
