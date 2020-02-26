import { InteractiveInstrument } from "../../interactive-instrument";
import { interactives } from "./interactives";
import { InteractiveTrack } from "../../types/interactive-track";
import fullSong from '../../../assets/music/full-composition.ogg';

export default function (): InteractiveTrack {
  return {
    interactives: interactives.map((i) => {
      const o = new InteractiveInstrument(i.color, i.sA, i.eA, i.sR, i.eR);
      o.cues = i.cues;
      o.name = i.name;
      return o;
    }),
    trackUrl: fullSong,
    tempo: 148,
    offset: -0.2,
  }
}