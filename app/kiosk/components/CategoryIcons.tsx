import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

// 1. Ikon Teknologi & AI (Chip AI)
export function TechAIIcon({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="7" y="7" width="10" height="10" rx="2" />
      {/* Teks AI */}
      <path d="M9.5 13.5l1.25-3.5 1.25 3.5M9.85 12.5h1.8" strokeWidth="1.5" />
      <path d="M14.5 10v3.5" strokeWidth="1.5" />
      {/* Pin Sirkuit */}
      <path d="M9 4v3M12 4v3M15 4v3" />
      <path d="M9 17v3M12 17v3M15 17v3" />
      <path d="M4 9h3M4 12h3M4 15h3" />
      <path d="M17 9h3M17 12h3M17 15h3" />
      {/* Node Lingkaran */}
      <circle cx="9" cy="3" r="1" fill="currentColor" />
      <circle cx="12" cy="3" r="1" fill="currentColor" />
      <circle cx="15" cy="3" r="1" fill="currentColor" />
      <circle cx="9" cy="21" r="1" fill="currentColor" />
      <circle cx="12" cy="21" r="1" fill="currentColor" />
      <circle cx="15" cy="21" r="1" fill="currentColor" />
      <circle cx="3" cy="9" r="1" fill="currentColor" />
      <circle cx="3" cy="12" r="1" fill="currentColor" />
      <circle cx="3" cy="15" r="1" fill="currentColor" />
      <circle cx="21" cy="9" r="1" fill="currentColor" />
      <circle cx="21" cy="12" r="1" fill="currentColor" />
      <circle cx="21" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

// 2. Ikon Pengetahuan Umum (Buku & Globe Orbit)
export function GeneralKnowledgeIcon({ className = 'w-6 h-6', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Globe Main Circle */}
      <circle cx="50" cy="38" r="26" />

      {/* Continents Details */}
      {/* North / South America (Left Side) */}
      <path
        d="M30 28c3 1 5 4 4 7-1 3-5 5-4 9 1 3 4 5 7 4 2-1 4-3 6-2 2 1 1 4 3 6 2 2 4 1 5-1"
        strokeWidth="2.5"
      />
      {/* Europe / Africa / Asia (Right Side) */}
      <path
        d="M58 20c2 2 5 1 6 3 1 2-1 4 1 6 2 2 5 1 6 4 1 2-2 4 0 6 2 2 4 0 5 2"
        strokeWidth="2.5"
      />

      {/* Orbit Ring around Globe */}
      <ellipse
        cx="50"
        cy="38"
        rx="34"
        ry="12"
        transform="rotate(-18 50 38)"
        strokeWidth="3.5"
      />

      {/* Open Book Base */}
      {/* Left Page Outer & Spine */}
      <path d="M50 90V63c-12-5-26 0-34 4v26c8-4 22-9 34-3z" fill="currentColor" fillOpacity="0.05" />
      <path d="M50 90V63c-12-5-26 0-34 4v26c8-4 22-9 34-3z" strokeWidth="4" />

      {/* Right Page Outer & Spine */}
      <path d="M50 90V63c12-5 26 0 34 4v26c-8-4-22-9-34-3z" fill="currentColor" fillOpacity="0.05" />
      <path d="M50 90V63c12-5 26 0 34 4v26c-8-4-22-9-34-3z" strokeWidth="4" />

      {/* Book Inner Page Lines / Thickness */}
      <path d="M19 71c8-3 20-7 28-3" strokeWidth="2.5" />
      <path d="M81 71c-8-3-20-7-28-3" strokeWidth="2.5" />
      <path d="M21 78c7-3 18-6 26-2" strokeWidth="2" />
      <path d="M79 78c-7-3-18-6-26-2" strokeWidth="2" />
    </svg>
  );
}

// 3. Ikon Literasi Digital (Laptop & Perisai Gembok Security)
export function DigitalLiteracyIcon({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Laptop Base */}
      <path d="M3 17h18a1 1 0 0 1 1 1v1H2v-1a1 1 0 0 1 1-1z" />
      <path d="M4 17V6a1 1 0 0 1 1-1h10" />
      <path d="M7 9h5M7 12h3" strokeWidth="1.5" />
      {/* Shield & Lock */}
      <path d="M15 8l4.5-1.5L21 8c0 4.5-2.5 7.5-6 9.5-3.5-2-6-5-6-9.5l1.5-1.5L15 8z" />
      <rect x="13.5" y="11" width="3" height="2.5" rx="0.5" />
      <path d="M14 11v-1a1 1 0 0 1 2 0v1" />
    </svg>
  );
}