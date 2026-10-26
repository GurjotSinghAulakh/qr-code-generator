import type { CSSProperties } from 'react';
import {
  ArrowRight, Check, ChevronDown, Copy, Download, ImageUp, Info,
  Link2, LockKeyhole, Plus, QrCode, RotateCcw, ScanLine,
  ShieldCheck, SlidersHorizontal, Sparkles, Type, UserRound, Wifi, X,
} from 'lucide-react';

const icons = {
  qr: QrCode, url: Link2, text: Type, wifi: Wifi, contact: UserRound,
  check: Check, lock: LockKeyhole, download: Download, arrow: ArrowRight,
  upload: ImageUp, reset: RotateCcw, scan: ScanLine, info: Info,
  copy: Copy, close: X, shield: ShieldCheck, spark: Sparkles,
  chevron: ChevronDown, sliders: SlidersHorizontal, plus: Plus,
} as const;
export type IconName = keyof typeof icons;
export function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  const Component = icons[name];
  return <Component size={size} strokeWidth={1.7} aria-hidden="true" focusable="false" style={style} />;
}
