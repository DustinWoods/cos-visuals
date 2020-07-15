import { Container, Sprite } from "pixi.js";

export default class EnvironmentLayer extends Container {
  private sprites: [Sprite,Sprite][];
  private currentSprite?: [Sprite, Sprite];
  private lastSpriteIndex = -1;
  private currentSpriteIndex = -1;
  private multiplier: number = 1;
  private transitionNum: number = 0;
  constructor(images: [string,string][], private lockEdgesToStage = false) {
    super();
    this.sprites = images.map(([left, right]) => {
      const leftSprite = Sprite.from(left);
      const rightSprite = Sprite.from(right);
      leftSprite.anchor.set(0,1);
      rightSprite.anchor.set(1,1);
      return [leftSprite,rightSprite]
    });
  }

  set activeSprite(index: number) {

    this.lastSpriteIndex = this.currentSpriteIndex;
    this.currentSpriteIndex = index;
    this.transitionNum = 1;

    if(this.currentSprite) {
      this.removeChild(this.currentSprite[0]);
      this.removeChild(this.currentSprite[1]);
      delete this.currentSprite;
    }

    if(index >= 0 && this.sprites[index]) {
      this.currentSprite = this.sprites[index];
      this.addChild(this.sprites[index][0]);
      this.addChild(this.sprites[index][1]);
      this.multiplierResize(this.multiplier);
    }
  }

  onTick(deltaMs: number) {
    if(this.transitionNum > 0) {
      this.transitionNum -= deltaMs / 1000;
      if(this.transitionNum <= 0) this.transitionNum = 0;
    }

  }

  multiplierResize(multiplier: number) {
    this.multiplier = multiplier;

    if(!this.currentSprite) {
      return;
    }

    const w = window.innerWidth;
    const h = window.innerHeight;

    if(this.lockEdgesToStage) {
      this.currentSprite[0].position.set(window.innerWidth/2 - multiplier * 450, 0);
      this.currentSprite[1].position.set(window.innerWidth/2 + multiplier * 450, 0);
    } else {
      this.currentSprite[0].position.set(0, 0);
      this.currentSprite[1].position.set(window.innerWidth, 0);
    }

    this.currentSprite[0].scale.set(multiplier);
    this.currentSprite[1].scale.set(multiplier);

  }

  draw() {

  }
}