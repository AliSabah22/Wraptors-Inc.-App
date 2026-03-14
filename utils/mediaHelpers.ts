/**
 * Media Hub utility helpers
 */

export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${Math.round(views / 1_000)}K`;
  return views.toString();
}

/** Returns a consistent [topColor, bottomColor] gradient pair for a video thumbnail */
export function getThumbColors(id: string): [string, string] {
  const palettes: [string, string][] = [
    ['#2C1F00', '#151000'],   // warm gold
    ['#001A2C', '#000D18'],   // steel blue
    ['#1C0000', '#0E0000'],   // deep crimson
    ['#001C00', '#000E00'],   // racing green
    ['#16001C', '#0B000E'],   // carbon purple
    ['#1C1800', '#0E0C00'],   // amber
    ['#001C18', '#000E0C'],   // teal
    ['#1A001A', '#0D000D'],   // midnight violet
  ];
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return palettes[hash % palettes.length];
}
