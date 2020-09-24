import { VideoPlayer } from "./video-player";
import { Graphics, Sprite, Loader, Container, Text, SCALE_MODES } from "pixi.js";
import videoMask from '../assets/images/video-mask.png';
import videoMaskFlat from '../assets/images/video-mask-flat.png';
import videoBkg from '../assets/images/video-bkg.png';
import { TEXT_STYLE_CENSORED } from "./styles";

const STAGE_WIDTH = 787;
const LETTERBOX_HEIGHT = 71;
const QUAD_CURVE_OFFSET = 175;
export class PerformanceVideoPlayer extends VideoPlayer {
  protected bkgCurtainPad = new Graphics();
  protected container = new Container();
  private flatMask: Sprite;
  private theaterMask: Sprite;
  private flatMaskBacker: Graphics;
  protected playButtonSizeRatio: number = 0.05;
  protected autoplay = false;
  public canInteract = false;
  private _theaterMode = true;
  constructor(public videoUrl: string, public width: number = STAGE_WIDTH, public accentColor: number = 0xffffff) {
    super(videoUrl, width, accentColor);
  }

  async preload() {
    await super.preload();
    const w = this.videoSprite.width;
    const h = this.videoSprite.height;

    await new Promise((resolve) => {
      if(Loader.shared.resources[videoMask]) return resolve();
      Loader.shared.add(videoMask).load(resolve);
    });
    await new Promise((resolve) => {
      if(Loader.shared.resources[videoMaskFlat]) return resolve();
      Loader.shared.add(videoMaskFlat).load(resolve);
    });
    await new Promise((resolve) => {
      if(Loader.shared.resources[videoBkg]) return resolve();
      Loader.shared.add(videoBkg).load(resolve);
    });

    const bkgSprite = Sprite.from(videoBkg);
    bkgSprite.scale.set(w / (bkgSprite.width));
    bkgSprite.position.set(0, LETTERBOX_HEIGHT);
    this.container.addChild(bkgSprite);

    this.flatMask = Sprite.from(videoMaskFlat);
    this.flatMask.scale.set(w / (this.flatMask.width));
    this.flatMask.position.set(0,LETTERBOX_HEIGHT);

    this.theaterMask = Sprite.from(videoMask);
    this.theaterMask.scale.set(w / (this.theaterMask.width));
    this.theaterMask.position.set(0,LETTERBOX_HEIGHT);

    this.flatMaskBacker = new Graphics();
    this.flatMaskBacker.clear()
      .beginFill(0x000000)
      .drawRect(0,0,this.flatMask.width, this.flatMask.height);
    this.container.addChild(this.flatMaskBacker);
    this.flatMaskBacker.position.set(0,LETTERBOX_HEIGHT)

    this.addChild(this.bkgCurtainPad);
    this.addChild(this.container);

    this.theaterMode = true;

    this.removeChild(this.videoSprite);
    this.removeChild(this.overlayGraphics);
    this.container.addChild(this.videoSprite);
    this.container.addChild(this.overlayGraphics);

  }

  interact() {
    if(!document.fullscreen) {
      this.playpause();
    } else {
      document.exitFullscreen();
    }
  }

  set theaterMode(on: boolean) {
    this._theaterMode = on;
    if(!on) {
      this.container.removeChild(this.flatMask);
      this.container.addChild(this.theaterMask);
      this.videoSprite.mask = this.theaterMask;
      //this.bkgCurtainPad.visible = true;
      this.flatMaskBacker.visible = false;
    } else {
      this.container.removeChild(this.theaterMask);
      this.container.addChild(this.flatMask);
      this.videoSprite.mask = this.flatMask;
      //this.bkgCurtainPad.visible = false;
      this.flatMaskBacker.visible = true;
    }

    this.multiplierResize(this.container.scale.x);
  }

  get theaterMode(): boolean {
    return this._theaterMode;
  }

  multiplierResize(multiplier: number) {
    if(!this.videoSprite) return;
    this.container.scale.set(multiplier);

    let paddTop = 0;
    if(!document.fullscreen) {
      const nav = document.getElementsByTagName("nav");
      if(nav && nav[0]) {
        const {y,height} = nav[0].getBoundingClientRect();
        paddTop = y + height;
      }
    }

    if(this._theaterMode) {
      this.container.position.y = (window.innerHeight - paddTop - this.container.height) / 2 - LETTERBOX_HEIGHT * multiplier + paddTop;
    } else {
      this.container.position.y = (-LETTERBOX_HEIGHT) * multiplier + paddTop;
    }
    this.container.position.x = (window.innerWidth - this.container.width) / 2;

    this.bkgCurtainPad.position.set(0, 0);
    this.bkgCurtainPad.clear()
      .beginFill(0x000000)
      .drawRect(0, this.container.position.y + LETTERBOX_HEIGHT * multiplier, this.container.position.x, this.container.height)
      .drawRect(this.container.width + this.container.position.x, this.container.position.y + LETTERBOX_HEIGHT * multiplier, this.container.position.x, this.container.height)
      .endFill();

  }

}