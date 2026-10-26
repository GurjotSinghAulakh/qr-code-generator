import type { CSSProperties } from 'react';

const paths = {
  qr: 'M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h3v3h3v3h-6z',
  url: 'M10 13a5 5 0 0 0 7 .1l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7-.1l-3 3a5 5 0 0 0 7 7l2-2',
  text: 'M4 5h16M12 5v14M8 19h8',
  wifi: 'M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8 16a6 6 0 0 1 8 0M12 20h.01',
  contact: 'M20 21v-2a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  check: 'M5 12l4 4L19 6',
  lock: 'M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4M12 14v3',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  upload: 'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5',
  reset: 'M3 11a9 9 0 1 1 2 7M3 4v7h7',
  scan: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 12h18',
  info: 'M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  copy: 'M9 9h12v12H9zM5 15H3V3h12v2',
  close: 'm6 6 12 12M6 18 18 6',
  shield: 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6zM8 12l3 3 5-6',
  spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',
} as const;
export type IconName = keyof typeof paths;
export function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>;
}
