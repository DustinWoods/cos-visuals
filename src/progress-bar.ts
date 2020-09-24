import { Graphics, Container, Text, Sprite } from "pixi.js";
import { TEXT_STYLE_LOADING } from "./styles";

const PROGRESS_BAR_WIDTH = 200;
const PROGRESS_BAR_HEIGHT = 30;

import note_8Up from '../assets/images/note-notations/8-up.svg';

export default class ProgressBar extends Container {
  private _progress: number = 0;
  private _animprogress: number = 0;
  //private graphics: Graphics = new Graphics();
  private needDraw = false;
  private loadingText = new Text("Loading", TEXT_STYLE_LOADING);
  private fading = false;
  private notes: Sprite[];
  private time: number = 0;

  constructor() {
    super();
    //this.graphics.alpha = 0;
    //this.addChild(this.graphics);
    this.addChild(this.loadingText);
    this.notes = [
      Sprite.from(note_8Up),
      Sprite.from(note_8Up),
      Sprite.from(note_8Up),
      Sprite.from(note_8Up),
      Sprite.from(note_8Up),
      Sprite.from(note_8Up),
    ];

    this.notes.forEach((n, i, a) => {
      this.addChild(n);
      n.anchor.set(0.5,1);
      n.scale.set(0.2);
      n.alpha = 0.25;
      n.position.set((((i+0.5)/a.length)-0.5) * PROGRESS_BAR_WIDTH, PROGRESS_BAR_HEIGHT + 10);
    });
    this.loadingText.anchor.set(0.5);
    this.loadingText.position.set(0,0);
    this.needDraw = true;
  }

  fadeOut() {
    this.removeChild(this.loadingText);
    this.fading = true;
    this.needDraw = true;
  }

  set progress(p: number) {
    this._progress = Math.max(0, Math.min(p, 1));
    this.needDraw = true;
  }

  get progress(): number {
    return this._progress;
  }

  get destroyed() {
    return this._destroyed;
  }

  onTick(deltaMs) {
    if(this.fading) {
      // this.graphics.alpha = Math.max(0, this.graphics.alpha - deltaMs / 100);
      this.notes.forEach((n, i, a) => {
        n.alpha = Math.max(0, n.alpha - deltaMs / 100);
      });
      if(this.notes[0].alpha <= 0) {
        this.destroy();
      }
    }

      this.time += deltaMs;
      this.notes.forEach((n, i, a) => {
        if(!this.fading && this._progress*a.length > i - 0.5) {
          n.alpha += deltaMs / 10;
          if(n.alpha > 1) n.alpha = 1;
        }
        n.position.y = PROGRESS_BAR_HEIGHT + 10 + (Math.sin(this.time/10 + i*Math.PI/6)+1)*10*n.alpha;
      });
    // if(this._animprogress != this._progress) {
    //   const diff = Math.abs(this._progress - this._animprogress);
    //   const dir = Math.sign(this._progress - this._animprogress);
    //   if(PROGRESS_BAR_WIDTH * diff < 1 && diff > 0) {
    //     this.needDraw = true;
    //     this._animprogress = this._progress;
    //   } else if(diff > 0) {
    //     this.needDraw = true;
    //     this._animprogress += Math.min(diff, dir * deltaMs / 100);
    //   }
    // }
    // if(this.needDraw) {
    //   this.draw();
    // }
  }

  // draw() {
  //   this.graphics.clear()
  //     .beginFill(0x000000)
  //     .drawRect(-window.innerWidth/2, -window.innerHeight/2, window.innerWidth, window.innerHeight)
  //     .endFill()
  //     if(!this.fading) {
  //       this.graphics
  //         .lineStyle(2, 0xffffff)
  //         .drawRect(-PROGRESS_BAR_WIDTH/2, -PROGRESS_BAR_HEIGHT/2, PROGRESS_BAR_WIDTH, PROGRESS_BAR_HEIGHT)
  //         .beginFill(0xffffff)
  //         .drawRect(-PROGRESS_BAR_WIDTH/2, -PROGRESS_BAR_HEIGHT/2, PROGRESS_BAR_WIDTH * this._animprogress, PROGRESS_BAR_HEIGHT)
  //     }

  //   this.needDraw = false;
  // }

}