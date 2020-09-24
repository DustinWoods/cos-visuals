import { Container, Loader, Texture, Sprite, Graphics, Point } from "pixi.js";

export class VideoPlayer extends Container {
  public isLoaded: boolean = false;
  protected videoSprite: Sprite;
  public nativeWidth: number;
  public nativeHeight: number;
  public nativeRatio: number;
  protected videoData: HTMLVideoElement;
  protected overlayGraphics: Graphics;
  private animationFrameId: number;
  public canInteract = true;
  protected playButtonSizeRatio = 0.1;
  statusText: string = "Unloaded";
  private loadProgress: number = 0;
  protected autoplay: boolean = false;

  constructor(public videoUrl: string, public playerWidth: number = 256, public accentColor: number = 0xeeeeee) {
    super();

    this.overlayGraphics = new Graphics();
    this.addChild(this.overlayGraphics);
    this.updateGraphics();

    this.interactive = true;
    this.cursor = "pointer";
    this.on('pointertap', () => {
      if(this.canInteract) {
        this.interact();
      }
    });
  }

  interact() {
    this.playpause();
  }

  get volume(): number {
    return this.videoData.volume;
  }

  set volume(v: number) {
    this.videoData.volume = v;
  }

  playpause() {
    if(this.videoData) {
      if(this.videoData.paused) {
        this.videoData.play();
        this.emit("play");
        this.statusText = "Playing";
        if(this.animationFrameId === -1) {
          this.animationFrameId = window.requestAnimationFrame(this.updateGraphics.bind(this));
        }
      } else {
        this.videoData.pause();
        this.emit("pause");
        this.statusText = "Paused";
        this.updateGraphics();
        if(this.animationFrameId !== -1) {
          window.cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = -1;
        }
      }
    }
  }

  pause() {
    if(this.videoData && !this.videoData.paused) {
      this.videoData.pause();
      this.emit("pause");
      this.statusText = "Paused";
      this.updateGraphics();
      if(this.animationFrameId !== -1) {
        window.cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = -1;
      }
    }
  }

  resume() {
    if(this.videoData && this.videoData.paused) {
      this.videoData.play();
      this.emit("play");
      this.statusText = "Playing";
      if(this.animationFrameId === -1) {
        this.animationFrameId = window.requestAnimationFrame(this.updateGraphics.bind(this));
      }
    }
  }

  set currentTime(value: number) {
    this.videoData.currentTime = value;
  }

  get currentTime(): number {
    return this.videoData.currentTime
  }

  get isPlaying(): boolean {
    return !this.videoData.paused;
  }

  get duration(): number {
    return this.videoData.duration;
  }

  get percentLoaded(): number {
    return this.loadProgress;
  }

  playerEnded() {
    this.emit("ended");
  }

  async preload() {
    this.statusText = "Loading";
    let playEventSet = false;
    if(!Loader.shared.resources[this.videoUrl]) {

      // If not already loaded
      await new Promise((resolve) => {
        const loaderTimer = setInterval(() => {
          if(typeof Loader.shared.resources[this.videoUrl] === "undefined") {
            return;
          }
          try {
            const buffered = Loader.shared.resources[this.videoUrl].data.buffered;
            const total = Loader.shared.resources[this.videoUrl].data.duration;

            const end = buffered.end(0);

            this.loadProgress = end/total;
          } catch {}

          if(!playEventSet) {
            Loader.shared.resources[this.videoUrl].data.addEventListener("playing", doneLoading);
            Loader.shared.resources[this.videoUrl].data.addEventListener("play", doneLoading);
            Loader.shared.resources[this.videoUrl].data.addEventListener("canplaythrough", doneLoading);
            playEventSet = true;
          }

        },200);

        const doneLoading = () => {
          clearInterval(loaderTimer);
          Loader.shared.resources[this.videoUrl].data.removeEventListener("playing", doneLoading);
          Loader.shared.resources[this.videoUrl].data.removeEventListener("play", doneLoading);
          Loader.shared.resources[this.videoUrl].data.removeEventListener("canplaythrough", doneLoading);
          resolve();
        }

        Loader.shared.add(this.videoUrl).load(doneLoading);

      });
    }

    await new Promise((resolve) => {
      Loader.shared.onComplete.once(resolve);
    });

    this.loadProgress = 1;

    this.videoData = Loader.shared.resources[this.videoUrl].data;
    const videoBaseTexture: Texture = Texture.from(this.videoData);

    this.videoData.addEventListener("ended", this.playerEnded.bind(this));

    this.videoData.loop = false;
    this.videoData.autoplay = this.autoplay;

    if(!this.autoplay) {
      setTimeout(() => {
        this.videoData.currentTime = 0;
      }, 0);
    }

    this.videoSprite = new Sprite(videoBaseTexture);
    this.nativeWidth = this.videoSprite.width;
    this.nativeHeight = this.videoSprite.height;
    this.nativeRatio = this.nativeWidth / this.nativeHeight;

    this.addChild(this.videoSprite);
    this.videoSprite.position.set(0,0);
    this.isLoaded = true;

    // Bring overlay back to top
    this.removeChild(this.overlayGraphics);
    this.addChild(this.overlayGraphics);

    this.statusText = "Paused";
    this.resizeVideo(this.playerWidth);
  }

  resizeVideo(playerWidth: number) {
    this.playerWidth = playerWidth;
    const scale = this.playerWidth / this.nativeWidth;
    this.videoSprite.scale.set(scale);
    this.updateGraphics();
  }

  updateGraphics() {
    if(this.videoSprite) {
      this.overlayGraphics.visible = true;
      this.overlayGraphics.position.set(this.playerWidth / 2, this.videoSprite.height / 2);
    } else {
      this.overlayGraphics.visible = false;
    }
    this.animationFrameId = window.requestAnimationFrame(this.updateGraphics.bind(this));
    this.overlayGraphics.clear();
    if(this.videoData) {
      if(this.videoData.paused && this.canInteract) {
        this.overlayGraphics.beginFill(this.accentColor);
        const r = this.playerWidth*this.playButtonSizeRatio;
        const c = Math.cos(Math.PI * 2/3);
        const s = Math.sin(Math.PI * 2/3);
        this.overlayGraphics.drawPolygon([
          new Point(c * r, -s * r),
          new Point(r, 0),
          new Point(c * r, s * r),
        ])
        this.overlayGraphics.endFill();
      }
    }
  }

  destroy() {
    // @TODO - clear loading of video if still in progress
    super.destroy();
    if(this.videoData) {
      this.videoData.removeEventListener("ended", this.playerEnded.bind(this));
      this.videoData.currentTime = 0;
      this.videoData.pause();
    }
  }
}