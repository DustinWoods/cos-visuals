import { BLEND_MODES, Container, filters, Sprite} from "pixi.js";

import note_8Up from '../assets/images/note-notations/8-up.svg';
import orb from '../assets/images/bloom-32x32.png';

export class ScoreReveal extends Container {

  private time: number = 0;
  private notes: [Sprite, number, number][];
  private totalScore: number = 0;
  private revealTime: number = 0;
  centerOrb: Sprite;

  constructor(private score: [boolean][]) {
    super();

    this.centerOrb = Sprite.from(orb)
    this.addChild(this.centerOrb);
    this.centerOrb.position.set(0,0);
    this.centerOrb.anchor.set(0.5);
    this.centerOrb.blendMode = BLEND_MODES.ADD;
    this.centerOrb.alpha = 0;

    this.notes = score.map(([gotIt], i, a) => {
      this.totalScore += gotIt ? 1 : 0;
      let note: Sprite;
      note = Sprite.from(orb);
      note.alpha = 0.4;
      note.anchor.set(0.5, 0.5);
      note.blendMode = BLEND_MODES.ADD;
      note.scale.set(0.2);
      this.addChild(note);
      return [note, 0, this.totalScore];
    });

    this.revealTime = (this.totalScore / this.notes.length) * 300;

  }

  setNotes(tOffset, radius) {
    this.notes.forEach(([note, revealed], i, a) => {
      let t = Math.PI*2 * (i/a.length) + Math.PI/2 + tOffset;
      note.position.set(Math.cos(t) * radius, -Math.sin(t) * radius);
      note.rotation = -t + Math.PI/2;
      if(revealed) {
        note.scale.set(Math.min(0.2, radius/400));
      } else {
        note.scale.set(Math.min(0.2, Math.max(0.8, radius/400)));
      }
    });
  }

  revealNotes(percent) {
    this.notes.forEach(([note, revealed, sIndex], i, a) => {
      if(!revealed && percent*this.totalScore > sIndex) {
        if(this.score[i][0]) {
          this.removeChild(note);
          note = Sprite.from(note_8Up);
          this.notes[i] = [note, 0.0001, sIndex];
          this.addChild(note);
          note.anchor.set(0.3, 0.9);
          note.scale.set(0.2);
          note.alpha = 0;
        }
      }
      if(revealed) {
        let al = percent*this.totalScore - sIndex;
        note.alpha = Math.min(1, al/10);
      }
    });
  }

  tick(deltaMs: number) {
    this.time += deltaMs;
    let radius = 200;
    if(this.time / 100 - Math.PI/2 < Math.PI/2) {
      radius = 100*(Math.sin(this.time / 100 - Math.PI/2) + 1);
    }

    this.revealNotes((this.time - 200)/(this.revealTime));
    let speedX = 2;
    if(this.time / 100 < Math.PI/2) {
      speedX = (Math.sin(this.time / 100) + 1);
    }
    if(this.time > (this.revealTime + 300)) {
      let fadeout = Math.min(1,(this.time - (this.revealTime + 300))/100);
      speedX = fadeout * 0.25 + 2;
      if(this.totalScore >= this.notes.length) {
        //this.alpha = 1 - fadeout;
        let fadeoutPh1 = Math.min(0.5, fadeout) * 2;
        let fadeoutPh2 = (Math.max(0.5, fadeout) - 0.5) * 2;
        radius = 200 - 200 * fadeoutPh1 * fadeoutPh1;
        this.centerOrb.alpha = Math.max(0.5, fadeoutPh2);
        this.centerOrb.scale.set((-(fadeoutPh2-1)*(fadeoutPh2-1) + 1) * 100);

      } else {
        this.alpha = 1 - fadeout;
        radius = 200 + 500 * fadeout * fadeout;
      }

      if(fadeout >= 1) {
        this.emit("done", this.totalScore >= this.notes.length);
        this.destroy();
      }
    }
    this.setNotes(0.5 * speedX * this.time / 100, radius);
  }

}