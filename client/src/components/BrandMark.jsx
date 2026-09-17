// Custom mark instead of a generic "AI sparkle" icon — a document with a
// verified badge, which is literally what the product does (answers
// checked against your document), not a decorative stand-in for "AI".
// Always rendered white, since every place it's used sits on a colored
// (accent/gradient) background.
export default function BrandMark({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="3" width="12" height="17" rx="2.5" fill="white" />
      <rect x="6.3" y="7.2" width="6.4" height="1.5" rx="0.75" fill="white" fillOpacity="0.35" />
      <rect x="6.3" y="10.6" width="6.4" height="1.5" rx="0.75" fill="white" fillOpacity="0.35" />
      <rect x="6.3" y="14" width="4" height="1.5" rx="0.75" fill="white" fillOpacity="0.35" />
      <circle cx="17" cy="17" r="5.5" fill="white" />
      <path d="M14.7 17.1l1.6 1.6 3.1-3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
