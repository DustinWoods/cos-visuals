import { Instrument } from "./types/instruments";
import { rgbToDecimal } from "./color-utils";

export const INSTRUMENT_COLORS: {[key in Instrument]?: number} = {
  ["Violin"]: 0xaa4444,
  ["Viola"]: 0xaa4444,
  ["Cello"]: 0xaa4444,
  ["Bass"]: 0xaa4444,
  ["Harp"]: 0xaa4444,

  ["Flute"]: 0xaaaa44,
  ["Piccolo"]: 0xaaaa44,
  ["Oboe"]: 0xaaaa44,
  ["English Horn"]: 0xaaaa44,
  ["Clarinet"]: 0xaaaa44,
  ["Basset Horn"]: 0xaaaa44,
  ["Bass Clarinet"]: 0xaaaa44,
  ["Bassoon"]: 0xaaaa44,
  ["Double Bassoon"]: 0xaaaa44,
  ["Saxophone"]: 0xaaaa44,

  ["French Horn"]: 0xccee66,
  ["Trumpet"]: 0xccee66,
  ["Cornet"]: 0xccee66,
  ["Slide Trombone"]: 0xccee66,
  ["Tuba"]: 0xccee66,

  ["Timpani"]: 0x7700ee,
  ["Bass Drum"]: 0x7700ee,
  ["Snare Drum"]: 0x7700ee,
  ["Chimes"]: 0x7700ee,
  ["Cymbals"]: 0x7700ee,
  ["Gong"]: 0x7700ee,
  ["Triangle"]: 0x7700ee,
  ["Glockenspiel"]: 0x7700ee,
  ["Xylophone"]: 0x7700ee,
  ["Castanets"]: 0x7700ee,
  ["Tambourine"]: 0x7700ee,
}

export const DEFAULT_INSTRUMENT_COLOR = 0x1111ff;


export const COLOR_BOOKSTORE_HIGHLIGHT = rgbToDecimal(<[number,number,number]>[63,54,42].map(d => d/100));
export const COLOR_BOOKSTORE_A = <[number,number,number]>[63,54,41].map(d => d/100);
export const COLOR_BOOKSTORE_B = <[number,number,number]>[33,22,11].map(d => d/100);

export const COLOR_BUS_HIGHLIGHT = rgbToDecimal(<[number,number,number]>[62,63,61].map(d => d/100));
export const COLOR_BUS_A = <[number,number,number]>[62,63,61].map(d => d/100);
export const COLOR_BUS_B = <[number,number,number]>[21,22,19].map(d => d/100);

export const COLOR_DESERT_HIGHLIGHT = rgbToDecimal(<[number,number,number]>[60,50,42].map(d => d/100));
export const COLOR_DESERT_A = <[number,number,number]>[61,49,42].map(d => d/100);
export const COLOR_DESERT_B = <[number,number,number]>[29,20,13].map(d => d/100);

export const COLOR_FOREST_HIGHLIGHT = rgbToDecimal(<[number,number,number]>[61,60,36].map(d => d/100));
export const COLOR_FOREST_A = <[number,number,number]>[61,60,32].map(d => d/100);
export const COLOR_FOREST_B = <[number,number,number]>[16,20,12].map(d => d/100);

export const COLOR_LAKE_HIGHLIGHT = rgbToDecimal(<[number,number,number]>[49,55,59].map(d => d/100));
export const COLOR_LAKE_A = <[number,number,number]>[49,55,60].map(d => d/100);
export const COLOR_LAKE_B = <[number,number,number]>[11,15,14].map(d => d/100);

export const COLOR_MOUNTAIN_HIGHLIGHT = rgbToDecimal(<[number,number,number]>[66,62,64].map(d => d/100));
export const COLOR_MOUNTAIN_A = <[number,number,number]>[67,63,64].map(d => d/100);
export const COLOR_MOUNTAIN_B = <[number,number,number]>[28,26,29].map(d => d/100);

export const COLOR_RECAP_HIGHLIGHT = rgbToDecimal(<[number,number,number]>[0,0,100].map(d => d/100));
export const COLOR_RECAP_A = <[number,number,number]>[0,0,100].map(d => d/100);
export const COLOR_RECAP_B = <[number,number,number]>[0,100,0].map(d => d/100);

export const COLOR_HALL_HIGHLIGHT = rgbToDecimal(<[number,number,number]>[96,92,81].map(d => d/100));
export const COLOR_HALL_A = <[number,number,number]>[16,9,8].map(d => d/100);
export const COLOR_HALL_B = <[number,number,number]>[96,92,81].map(d => d/100);








