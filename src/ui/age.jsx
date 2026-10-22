import { sx } from './sx.js';

// An age label (AGE in data.js): Ages 6 to 10 in yellow, Ages 10 to 15 in pink. With grownUp, it carries 👪:
// the player is younger than the label, so a grown-up plays along.
export function AgeChip({ band, grownUp, big }) {
  return (
    <span role="img" aria-label={band.label + (grownUp ? ', with a grown-up' : '')}
      style={{ ...sx('display:inline-flex;align-items:center;gap:4px;font-weight:900;letter-spacing:.5px;border-radius:999px;white-space:nowrap;' + (big ? 'font-size:12px;padding:4px 10px' : 'font-size:11px;padding:3px 8px')), background: band.bg, color: band.fg }}>
      {grownUp && <span aria-hidden="true">👪</span>}{band.label.toUpperCase()}
    </span>
  );
}
