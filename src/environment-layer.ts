import { Container, Sprite } from "pixi.js";

export default class EnvironmentLayer extends Container {
  private sprites: [Sprite,Sprite][];
  private currentSprite?: [Sprite, Sprite];
  private lastSpriteIndex = -1;
  private tweeningFn?: CallableFunction;
  private transitionComplete?: CallableFunction;
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

    if(this.currentSprite && index < 0) {
      this.fadeOut(0.5).then(() => {
        if(this.currentSprite) {
          this.removeChild(this.currentSprite[0]);
          this.removeChild(this.currentSprite[1]);
          delete this.currentSprite;
        }
      });
    } else {

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
        this.fadeIn(2);
      }
    }
  }

  async fadeOut(transitionNum) {
    this.transitionNum = transitionNum;
    return new Promise((r) => {
      this.tweeningFn = (t) => {
        if(this.currentSprite) {
          this.currentSprite[0].alpha = t/transitionNum;
          this.currentSprite[1].alpha = t/transitionNum;
        }
      };
      this.transitionComplete = r;
    });
  }

  async fadeIn(maxNum) {
    this.transitionNum = maxNum;
    return new Promise((r) => {
      this.tweeningFn = (t) => {
        const tt = t/maxNum;
        if(this.currentSprite) {
          this.currentSprite[0].alpha = Math.min(1, Math.max(0,2*(1-tt)));
          this.currentSprite[1].alpha = Math.min(1, Math.max(0,2*(1-tt)));

          if(!this.lockEdgesToStage) {
            let it = 1-tt;
            let slideScale = 0.1;
            this.currentSprite[0].anchor.set(slideScale*(it*(it-2)+1),1); // 1 to 0
            this.currentSprite[1].anchor.set((1-slideScale) + slideScale*(-it*(it-2)),1); // 0 to 1
          }
        }
      };
      this.transitionComplete = r;
    });
  }
  onTick(deltaMs: number) {
    if(this.transitionNum > 0) {
      this.transitionNum -= deltaMs / 100;
      if(this.tweeningFn) this.tweeningFn(Math.max(0, this.transitionNum));
      if(this.transitionNum <= 0) {
        this.transitionNum = 0;
        if(this.transitionComplete) {
          this.transitionComplete();
          this.transitionComplete = undefined;
          this.tweeningFn = undefined;
        }
      }
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