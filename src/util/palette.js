// Muted color palette cycled through as courses get added
const PALETTE = ["#3D7068", "#4A7FA6", "#6B5B95", "#B5563C", "#A67C3D", "#8C4A5B"];

export function colorForIndex(i) {
  return PALETTE[i % PALETTE.length];
}
