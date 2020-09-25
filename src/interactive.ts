import { Container, InteractionEvent } from "pixi.js";

export abstract class Interactive extends Container {
  // beat, state, value
  cues: Array<[number, number, number]> = [];
  name: string = "";
  protected stateFade = 0;
  protected stateFadeTime = 1;
  protected dragHover: boolean = false;
  abstract multiplierResize(multiplier: number): void;
  abstract setState(newState: number, value: number, cue: number): void;
  protected currentBeat: number;

  onCue(cue: number, state: number, value: number) {
    this.setState(state, value, cue);
  }

  onDragOver(e: InteractionEvent) {
    this.dragHover = true;
  }

  onDragOut(e: InteractionEvent) {
    this.dragHover = false;
  }

  onTick(currentBeat: number, deltaBeat: number) {
    this.currentBeat = currentBeat;
    if(this.stateFade < 1) {
      this.stateFade += this.stateFadeTime * deltaBeat;
      if(this.stateFade > 1) {
        this.stateFade = 1;
      }
    }
  }

  constructor() {
    super();
  }

}