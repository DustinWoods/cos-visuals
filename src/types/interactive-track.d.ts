import { Interactive } from "../interactive";
import { ParticleCue } from "./particle-cue";

export type InteractiveTrack = {
  interactives: Array<Interactive>;
  particleCues: Array<[number, ParticleCue]>,
  trackUrl: string;
  tempo: number;
  offset: number;
  stageSize: [number, number];
  stageCenter: [number, number];
}