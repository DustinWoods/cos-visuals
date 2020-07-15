import { Point } from "pixi.js";

export function linearLerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function linearLerpVec3(from: [number,number,number], to: [number,number,number], t: number): [number,number,number] {
  return [linearLerp(from[0], to[0], t),linearLerp(from[1], to[1], t),linearLerp(from[2], to[2], t)];
}

export function linearLerpPoint(from: Point, to: Point, t: number): Point {
  return new Point(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
}

export function powLerp(from: number, to: number, t: number, pow: number): number {
  const t2 = Math.pow(t, pow);
  return from + (to - from) * t2;
}

export function powLerpPoint(from: Point, to: Point, t: number, pow: number): Point {
  const t2 = Math.pow(t, pow);
  return new Point(from.x + (to.x - from.x) * t2, from.y + (to.y - from.y) * t2);
}