/**
 * Placeholder typings for Remotion.
 * This allows imports from 'remotion' to resolve without errors
 * until we can properly install the actual Remotion library.
 */

declare module 'remotion' {
  export const AbsoluteFill: React.FC<any>;
  export const Audio: React.FC<any>;
  export const Sequence: React.FC<any>;
  export function useCurrentFrame(): number;
  export function useVideoConfig(): { width: number; height: number; fps: number; durationInFrames: number };
  export function staticFile(path: string): string;
  export const interpolate: any;
}

declare module '@remotion/player' {
  export const Player: React.FC<any>;
  export type PlayerRef = any;
} 