export type Point = { x: number; y: number };
export declare const WORLD: { width: number; height: number };
export declare const CENTER: Point;
export declare function edgeEndpoints(from: Point, to: Point, fromRadius: number, toRadius: number): { x1: number; y1: number; x2: number; y2: number };
export declare function overviewLayout(counts: Record<string, number>): (Point & { id: string; count: number; r: number })[];
export declare function ringLayout(count: number): Point[];
export declare function egoLayout(groups: { type: string; ids: string[] }[]): {
  positions: Map<string, Point>;
  arcs: { type: string; from: number; to: number; mid: number }[];
};
