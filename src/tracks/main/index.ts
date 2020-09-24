import { InteractiveInstrument } from "../../interactive-instrument";
import { interactives } from "./track-interactives";
import { InteractiveTrack } from "../../types/interactive-track";

export default function (): InteractiveTrack {
  return {
    interactives: interactives.map((i) => {
      const o = new InteractiveInstrument(i.color, i.graphicsPath);
      o.cues = i.cues;
      o.name = i.name;
      return o;
    }),
    stageSize: [787, 203],
    stageCenter: [787 / 2, 203],
    particleCues: [],//particles,
    tempo: 148,
    offset: 66.440 - 4.917 - 0.202, // start of violin, and 4.917 is "magic number"
  }
}
