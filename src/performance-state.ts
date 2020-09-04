import { Container, Application, Point, Sprite, InteractionEvent, InteractionData, Loader } from "pixi.js";
import ClickTrack from 'click-track';
import State from "./state";
import { InteractiveInstrument } from "./interactive-instrument";
import { DraggableSpawn } from "./draggable-spawn";
import { Interactive } from "./interactive";
import mainTrack from "./tracks/main/";
import { CueEvent } from "click-track/dist/src/definitions/cue-event";
import { Emitter } from "pixi-particles";
import { ParticleCue } from "./types/particle-cue";
import { Draggable } from "./draggable";
import { PerformanceVideoPlayer } from "./performance-video-player";
import ProgressBar from "./progress-bar";
import GradientBackdrop from "./gradient-backdrop";
import stageImage from '../assets/images/stage_complete_2.svg';
import { COLOR_BOOKSTORE_HIGHLIGHT, COLOR_BUS_HIGHLIGHT, COLOR_DESERT_HIGHLIGHT, COLOR_FOREST_HIGHLIGHT, COLOR_LAKE_HIGHLIGHT, COLOR_MOUNTAIN_HIGHLIGHT, COLOR_RECAP_HIGHLIGHT, COLOR_HALL_HIGHLIGHT } from "./colors";
import { Button } from "./button";


import environmentFgLeftBusUrl from '../assets/images/environments/bus/bus_foreground_left.svg';
import environmentFgRightBusUrl from '../assets/images/environments/bus/bus_foreground_right.svg';

import environmentBkgLeftBookstoreUrl from '../assets/images/environments/bookstore/bookstore_background_left.svg';
import environmentBkgRightBookstoreUrl from '../assets/images/environments/bookstore/bookstore_background_right.svg';
import environmentFgLeftBookstoreUrl from '../assets/images/environments/bookstore/bookstore_foreground_left.svg';
import environmentFgRightBookstoreUrl from '../assets/images/environments/bookstore/bookstore_foreground_right.svg';

import environmentBkgLeftDesertUrl from '../assets/images/environments/desert/desert_background_left.svg';
import environmentBkgRightDesertUrl from '../assets/images/environments/desert/desert_background_right.svg';
import environmentFgLeftDesertUrl from '../assets/images/environments/desert/desert_foreground_left.svg';
import environmentFgRightDesertUrl from '../assets/images/environments/desert/desert_foreground_right.svg';

import environmentBkgLeftForestUrl from '../assets/images/environments/forest/forest_background_left.svg';
import environmentBkgRightForestUrl from '../assets/images/environments/forest/forest_background_right.svg';
import environmentFgLeftForestUrl from '../assets/images/environments/forest/forest_foreground_left.svg';
import environmentFgRightForestUrl from '../assets/images/environments/forest/forest_foreground_right.svg';

import environmentBkgLeftLakeUrl from '../assets/images/environments/lake/lake_background_left.svg';
import environmentBkgRightLakeUrl from '../assets/images/environments/lake/lake_background_right.svg';
import environmentFgLeftLakeUrl from '../assets/images/environments/lake/lake_foreground_left.svg';
import environmentFgRightLakeUrl from '../assets/images/environments/lake/lake_foreground_right.svg';

import environmentBkgLeftMountainUrl from '../assets/images/environments/mountain/mountain_background_left.svg';
import environmentBkgRightMountainUrl from '../assets/images/environments/mountain/mountain_background_right.svg';
import environmentFgLeftMountainUrl from '../assets/images/environments/mountain/mountain_foreground_left.svg';
import environmentFgRightMountainUrl from '../assets/images/environments/mountain/mountain_foreground_right.svg';

import EnvironmentLayer from "./environment-layer";

type InteractiveCue = [Interactive, number, any];

export default class PerformanceState extends State {

  protected track: HTMLAudioElement;
  protected bkgVideo: PerformanceVideoPlayer;
  protected interactives: Array<Interactive>;
  private app: Application;
  static clickTrack: ClickTrack<InteractiveCue>;
  private clickTrackParticles: ClickTrack<ParticleCue>;
  private interactivesContainer: Container;
  private particleContainer: Container;
  private emitters: Array<Emitter> = [];
  protected intendedStageSize: [number, number];
  protected centerStage: [number, number];
  protected loadProgressbar: ProgressBar;
  protected stageInteractiveBackground: Sprite = Sprite.from(stageImage);
  private foregroundEnvironment: EnvironmentLayer;
  private backgroundEnvironment: EnvironmentLayer;
  protected bkg = new GradientBackdrop();
  private skipButton: Button;
  private conductToggleButton: Button;

  // DIY interaction management
  private interactiveHovering?: Interactive;
  private mousePos: Point;
  private mouseChecked: boolean = true;
  static dragSpawn: DraggableSpawn = new DraggableSpawn();

  async createContainer(app: Application): Promise<Container> {
    this.app = app;

    // The container to be returned
    const container = new Container();

    container.addChild(this.bkg);
    this.bkg.colorA = [0,0,0];
    this.bkg.colorB = [0,0,0];

    this.bkg.position.set(0,0);


    // Get music track information
    const {
      interactives,
      trackUrl,
      tempo,
      offset,
      particleCues,
      stageSize,
      stageCenter,
    } = mainTrack();

    app.renderer.backgroundColor = 0x000000;

    this.intendedStageSize = [stageSize[0] + 250, (stageSize[1] + 416)];
    this.centerStage = stageCenter;

    this.bkgVideo = new PerformanceVideoPlayer(trackUrl, stageSize[0] + 250);
    this.bkgVideo.alpha = 0;
    container.addChild(this.bkgVideo);
    this.bkgVideo.position.set(0,0);
    this.bkgVideo.on("play", () => {
      if(!document.fullscreen) {
        try {
          app.view.requestFullscreen();
          screen.orientation.lock("landscape-primary");
        } catch {}
      }
    });

    const environmentBiomeIndexes = {
      bus: 0,
      bookstore: 1,
      desert: 2,
      forest: 3,
      lake: 4,
      mountain: 5,
    };

    this.foregroundEnvironment = new EnvironmentLayer([
      [environmentFgLeftBusUrl, environmentFgRightBusUrl],
      [environmentFgLeftBookstoreUrl, environmentFgRightBookstoreUrl],
      [environmentFgLeftDesertUrl, environmentFgRightDesertUrl],
      [environmentFgLeftForestUrl, environmentFgRightForestUrl],
      [environmentFgLeftLakeUrl, environmentFgRightLakeUrl],
      [environmentFgLeftMountainUrl, environmentFgRightMountainUrl],
    ]);

    this.backgroundEnvironment = new EnvironmentLayer([
      // use bus blg as foreground too
      [environmentFgLeftBusUrl, environmentFgRightBusUrl],
      [environmentBkgLeftBookstoreUrl, environmentBkgRightBookstoreUrl],
      [environmentBkgLeftDesertUrl, environmentBkgRightDesertUrl],
      [environmentBkgLeftForestUrl, environmentBkgRightForestUrl],
      [environmentBkgLeftLakeUrl, environmentBkgRightLakeUrl],
      [environmentBkgLeftMountainUrl, environmentBkgRightMountainUrl],
    ], true);

    this.foregroundEnvironment.activeSprite = -1;
    this.backgroundEnvironment.activeSprite = -1;

    container.addChild(this.backgroundEnvironment);

    // Assemble interactive things
    this.interactivesContainer = new Container();
    this.interactivesContainer.visible = false;
    container.addChild(this.interactivesContainer);
    this.interactivesContainer.position.set(window.innerWidth / 2, window.innerHeight * 3 / 4);

    // DIY interaction management
    this.interactivesContainer.interactive = true;
    this.interactivesContainer.on("mousemove", this.onMove.bind(this));

    this.interactives = interactives;

    this.interactivesContainer.addChild(this.stageInteractiveBackground);

    this.interactives.forEach((s1) => {
      s1.interactive = true;
      this.interactivesContainer.addChild(s1);
      s1.on("maybeSpawn", this.interactiveTapSpawn.bind(this));
    });

    // Origin set is handled in resize
    PerformanceState.dragSpawn.visible = false;
    container.addChild(PerformanceState.dragSpawn);
    PerformanceState.dragSpawn.on("dragged", this.onCircleDrag.bind(this));
    interactives.push(PerformanceState.dragSpawn);

    // Add childred
    container.addChild(this.foregroundEnvironment);

    // Assemble cues
    const cues: Array<[number, InteractiveCue]> = [];

    // Combine cues from all interactives
    interactives.forEach((ii) => {
      cues.push(...ii.cues.map<[number, InteractiveCue]>((cue) => [cue[0], [ii, cue[1], cue[2]]]));
    });

    // Sort all cues ascending
    cues.sort((a, b) => Math.sign(a[0] - b[0]));

    // Click track for syncing up
    PerformanceState.clickTrack = new ClickTrack<InteractiveCue>({
      timerSource: () => {
        try {
          return this.bkgVideo.currentTime
        } catch {
          return 0;
        }
      },
      tempo,
      offset,
      cues: cues
    });

    PerformanceState.clickTrack.on("cue", this.handleClickCue.bind(this));

    const switchBiomeTheme = (theme: string) => {
      this.bkg.biomeTheme = theme;
      if(typeof environmentBiomeIndexes[theme] !== "undefined") {
        this.foregroundEnvironment.activeSprite = environmentBiomeIndexes[theme];
        if(theme === "bus") {
          // bus doesn't have a bklg
          this.backgroundEnvironment.activeSprite = -1;
        } else {
          this.backgroundEnvironment.activeSprite = environmentBiomeIndexes[theme];
        }
      } else {
        this.foregroundEnvironment.activeSprite = -1;
        this.backgroundEnvironment.activeSprite = -1;
      }
      this.interactives.forEach((i) => {
        if(i instanceof InteractiveInstrument) {
          switch (theme) {
            case "bookstore":
            case "night":
              i.highlightColor = COLOR_BOOKSTORE_HIGHLIGHT;
              break;

            case "bus":
              i.highlightColor = COLOR_BUS_HIGHLIGHT;
              break;

            case "desert":
              i.highlightColor = COLOR_DESERT_HIGHLIGHT;
              break;

            case "forest":
              i.highlightColor = COLOR_FOREST_HIGHLIGHT;
              break;

            case "lake":
              i.highlightColor = COLOR_LAKE_HIGHLIGHT;
              break;

            case "mountain":
              i.highlightColor = COLOR_MOUNTAIN_HIGHLIGHT;
              break;

            case "recap":
              i.highlightColor = COLOR_RECAP_HIGHLIGHT;
              break;

            case "hall":
            default:
              i.highlightColor = COLOR_HALL_HIGHLIGHT;
              break;
          }
        };
      });
    }

    const switchBkgColors = (data: [[number,number,number],[number,number,number]]) => {
      this.bkg.colorA = <[number,number,number]>data[0].map(d => d/100);
      this.bkg.colorB = <[number,number,number]>data[1].map(d => d/100);
    }

    const biomeClickTrack = new ClickTrack<() => void>({
      timerSource: PerformanceState.clickTrack.timer,
      cues: [
        [0, switchBkgColors.bind(this, [[0,0,0],[0,0,0]])],
        [15.0, switchBkgColors.bind(this, [[38,27,17],[6,9,9]])],
        [17.0, switchBkgColors.bind(this, [[54,41,31],[2,6,4]])],
        [25.0, switchBkgColors.bind(this, [[18,19,16],[4,8,8]])],
        [32.5, switchBkgColors.bind(this, [[4,8,8], [95,98,95]])],
        [40.8, switchBkgColors.bind(this, [[29,27,24],[7,5,3]])],
        [49.0, switchBkgColors.bind(this, [[25,24,22],[2,7,7]])],
        [56.0, switchBkgColors.bind(this, [[7,5,3],[29,27,24]])],
        [66.0, switchBkgColors.bind(this, [[7,5,3],[7,5,3]])],
        [67.0, switchBkgColors.bind(this, [[7,5,3],[7,5,3]])],
        [67, () => {

          this.afterIntro(container);

          const beginAfterIntro = () => {
            this.bkgVideo.resume();
            this.bkgVideo.canInteract = true;
            if(this.conductToggleButton) {
              this.conductToggleButton.off("pointertap", beginAfterIntro);
            }
          };

          this.bkgVideo.canInteract = false;
          this.bkgVideo.pause();
          this.playMode();

          this.conductToggleButton.once("pointertap", beginAfterIntro);
          PerformanceState.dragSpawn.on('firstDrag',beginAfterIntro);
        }],
        [60  + 23.6, switchBiomeTheme.bind(this, "lake")], // lake
        [60  + 49.5, switchBiomeTheme.bind(this, "hall")], // hall
        [60  + 59.1, switchBiomeTheme.bind(this, "desert")], // desert
        [120 + 41.7, switchBiomeTheme.bind(this, "hall")], // hall
        [120 + 50.9, switchBiomeTheme.bind(this, "forest")], // forest
        [180 + 6.5, switchBiomeTheme.bind(this, "hall")], // hall
        [180 + 20, switchBiomeTheme.bind(this, "mountain")], // mountain
        [180 + 53, switchBiomeTheme.bind(this, "hall")], // hall
        [240 + 0, switchBiomeTheme.bind(this, "bus")], // bus
        [240 + 32, switchBiomeTheme.bind(this, "night")], // bus
        [240 + 40, switchBiomeTheme.bind(this, "bookstore")], // book store
        [300 + 0, switchBiomeTheme.bind(this, "hall")], // hall
        [300 + 1.5, switchBiomeTheme.bind(this, "lake")], // lake
        [300 + 7, switchBiomeTheme.bind(this, "forest")], // forest
        [300 + 11.5, switchBiomeTheme.bind(this, "mountain")], // mountain
        [300 + 17.2, switchBiomeTheme.bind(this, "desert")], // desert
        [300 + 21, switchBiomeTheme.bind(this, "lake")], // lake
        [300 + 25, switchBiomeTheme.bind(this, "mountain")], // mountain
        [300 + 30.5, switchBiomeTheme.bind(this, "lake")], // lake
        [300 + 33, switchBiomeTheme.bind(this, "bookstore")], // book store
        [300 + 40.7, switchBiomeTheme.bind(this, "forest")], // forest
        [300 + 43, switchBiomeTheme.bind(this, "desert")], // desert
        [300 + 46.5, switchBiomeTheme.bind(this, "mountain")], // mountain
        [300 + 48, switchBiomeTheme.bind(this, "lake")], // lake
        [300 + 51, switchBiomeTheme.bind(this, "hall")], // hall
        [356,
          () => {
           this.theaterMode();

            container.removeChild(this.conductToggleButton);
           this.bkg.colorA = [0,0,0];
           this.bkg.colorB = [0,0,0];
          }
        ],
      ]
    });

    biomeClickTrack.on("cue", (e, {data}) => data && data());

    // Sort all cues ascending
    particleCues.sort((a, b) => Math.sign(a[0] - b[0]));

    // this.clickTrackParticles = new ClickTrack<ParticleCue>({
    //   timerSource: () => track.currentTime,
    //   tempo,
    //   offset,
    //   cues: particleCues
    // });

    //this.clickTrackParticles.on("cue", this.handleParticleCue.bind(this));

    //this.particleContainer = new Container();
    // SVG group size: 828 131.65
    // Set instrument position to SVG group center
    // @TODO put this in one spot
    //this.particleContainer.position.set(window.innerWidth / 2 - 414, window.innerHeight * 3 / 4 -131.65);
    //container.addChild(this.particleContainer);

    this.loadProgressbar = new ProgressBar();
    container.addChild(this.loadProgressbar);
    this.loadProgressbar.position.set(window.innerWidth/2, window.innerHeight/2);
    const loadIntervalCheck = setInterval(() => {
      this.loadProgressbar.progress = this.bkgVideo.percentLoaded;
    }, 200);

    const loadPromise = new Promise(async (resolve, reject) => {
      await new Promise((resolve, reject) => {

        Loader.shared.add(
          environmentFgLeftBusUrl,
          environmentFgRightBusUrl,
          environmentBkgLeftBookstoreUrl,
          environmentBkgRightBookstoreUrl,
          environmentFgLeftBookstoreUrl,
          environmentFgRightBookstoreUrl,
          environmentBkgLeftDesertUrl,
          environmentBkgRightDesertUrl,
          environmentFgLeftDesertUrl,
          environmentFgRightDesertUrl,
          environmentBkgLeftForestUrl,
          environmentBkgRightForestUrl,
          environmentFgLeftForestUrl,
          environmentFgRightForestUrl,
          environmentBkgLeftLakeUrl,
          environmentBkgRightLakeUrl,
          environmentFgLeftLakeUrl,
          environmentFgRightLakeUrl,
          environmentBkgLeftMountainUrl,
          environmentBkgRightMountainUrl,
          environmentFgLeftMountainUrl,
          environmentFgRightMountainUrl,
        ).load(resolve);
      });
      await new Promise((resolve, reject) => {
        const loadTimeout = setTimeout(() => {
          // Timeout error?
          console.log("This is taking a while to load...");
        }, 5000);
        this.bkgVideo.preload().then(() => {
          clearTimeout(loadTimeout);
          resolve();
        });
      });
      this.bkgVideo.alpha = 1;
      this.bkgVideo.canInteract = true;
      this.loadProgressbar.progress = 1;

      this.skipButton = new Button("SKIP INTRO");
      this.skipButton.setAnchor(1, 1);
      container.addChild(this.skipButton);
      this.skipButton.on("pointertap", () => {
        this.bkgVideo.currentTime = 66;
        this.afterIntro(container);
      });

      clearInterval(loadIntervalCheck);
      this.loadProgressbar.fadeOut();

      this.onResize({width: window.innerWidth, height: window.innerHeight});
      resolve();

    });


    this.bkgVideo.on("ended", () => {
      // shut it down!
      biomeClickTrack.deconstruct();
      PerformanceState.clickTrack.deconstruct();
      //this.clickTrackParticles.deconstruct();
      if(document.fullscreen) {
        document.exitFullscreen();
      }
      this.events.get("complete").dispatch(this, 1);
    });

    return container;
  }

  interactiveTapSpawn(interactive: InteractiveInstrument, e: InteractionEvent) {
    if(PerformanceState.dragSpawn && PerformanceState.dragSpawn.draggingObject) {
      interactive.onDrop(PerformanceState.dragSpawn.draggingObject);
    }
  }

  afterIntro(container: Container) {
    if(this.skipButton) {
      container.removeChild(this.skipButton);
      delete this.skipButton;
    }
    if(!this.conductToggleButton) {
      this.conductToggleButton = new Button("WATCH");
      this.conductToggleButton.setAnchor(1, 1);
      container.addChild(this.conductToggleButton);
      this.conductToggleButton.on("pointertap", () => {
        if(this.bkgVideo.theaterMode) {
          this.playMode();
          this.conductToggleButton.text = "WATCH";
        } else {
          this.theaterMode();
          this.conductToggleButton.text = "CONDUCT";
        }
      });
    }
    this.onResize({width: window.innerWidth, height: window.innerHeight});
  }

  theaterMode() {
    this.backgroundEnvironment.visible = false;
    this.interactivesContainer.visible = false;
    PerformanceState.dragSpawn.visible = false;
    this.bkgVideo.theaterMode = true;
    this.onResize({width: window.innerWidth, height: window.innerHeight});
  }

  playMode() {
    this.backgroundEnvironment.visible = true;
    this.interactivesContainer.visible = true;
    PerformanceState.dragSpawn.visible = true;
    this.bkgVideo.theaterMode = false;
    this.onResize({width: window.innerWidth, height: window.innerHeight});
  }

  handleClickCue(clicktrack: ClickTrack, cue: CueEvent<InteractiveCue>) {
    if(cue.data && cue.data[0]) {
      const [interactive, state, value] = cue.data;
      interactive.onCue(cue.cue, state, value);
    }
  }

  handleParticleCue(clicktrack: ClickTrack, cue: CueEvent<ParticleCue>) {
    if(cue.data) {
      const emitter = new Emitter(
        this.particleContainer,
        cue.data[0],
        {
          ...cue.data[1],
          autoUpdate: false,
        }
      );

      this.emitters.push(emitter);
    }
  }

  onCircleDrag(dragging: Draggable, e: InteractionEvent) {
    if (this.app) {
      const i = this.app.renderer.plugins.interaction.hitTest(e.data.global, this.interactivesContainer);
      if (i && i instanceof InteractiveInstrument) {
        i.emit("mousedragout", this.mousePos);
        i.emit("drop", dragging, e);
      }
    }
  }

  onMove(e: InteractionEvent) {
    this.mousePos = e.data.global;
    this.mouseChecked = false;
  }

  onTick(deltaMs: number) {

    this.bkg.onTick(deltaMs);
    this.foregroundEnvironment.onTick(deltaMs);
    this.backgroundEnvironment.onTick(deltaMs);

    if(this.loadProgressbar && !this.loadProgressbar.destroyed) {
      this.loadProgressbar.onTick(deltaMs);
      return;
    } else if(this.loadProgressbar) {
      delete this.loadProgressbar;
    }

    const currentBeat = PerformanceState.clickTrack.beat;
    const beatDelta = (deltaMs / 1000) * PerformanceState.clickTrack.tempo;

    for (let i = 0; i < this.interactives.length; i++) {
      this.interactives[i].onTick(currentBeat, beatDelta);
    }

    for (let i = this.emitters.length - 1; i >= 0; i--) {
      if(this.emitters[i].parent === null) {
        // remove from array, it's destroyed
        this.emitters.splice(i, 1);
        continue;
      }

      // Perform update using beats
      this.emitters[i].update(beatDelta);
    }


    // DIY mouse enter/mouse out interaction handling
    // This is here because while draggin draggables, mouseenter and mouseout events aren't triggered
    if(PerformanceState.dragSpawn.isDragging && this.app && !this.mouseChecked) {
      this.mouseChecked = true;
      const object = this.app.renderer.plugins.interaction.hitTest(this.mousePos, this.interactivesContainer);
      if (object && object instanceof Interactive) {
        const e = new InteractionEvent();
        e.data = new InteractionData();
        e.data.global = this.mousePos.clone();
        if(!this.interactiveHovering) {
          // Mouse enter
          this.interactiveHovering = object;
          this.interactiveHovering.emit("mousedragover", e, PerformanceState.dragSpawn.draggingObject);
        } else if(this.interactiveHovering !== object) {
          // Mouse enter and out (new object)
          object.emit("mousedragover", e);
          this.interactiveHovering.emit("mousedragout", e, PerformanceState.dragSpawn.draggingObject);
          this.interactiveHovering = object;
        }
      } else if(this.interactiveHovering) {
        const e = new InteractionEvent();
        e.data = new InteractionData();
        e.data.global = this.mousePos.clone();
        // mouse out
        this.interactiveHovering.emit("mousedragout", e);
        this.interactiveHovering = undefined;
      }
    }
  }

  onResize(size: { width: number, height: number }) {

    if(this.loadProgressbar && this.loadProgressbar.progress < 1) {
      this.loadProgressbar.position.set(size.width/2, size.height/2);
    }

    const multiplier = Math.min(size.width / this.intendedStageSize[0], size.height / this.intendedStageSize[1]);
    //this.interactivesContainer.scale.set(multiplier, multiplier);
    this.interactives.forEach((s1) => {
      s1.multiplierResize(multiplier);
    });

    this.stageInteractiveBackground.scale.set(multiplier);
    const bounds = this.interactivesContainer.getBounds();

    this.bkg.multiplierResize(multiplier);

    this.bkgVideo.multiplierResize(multiplier);

    const videoBounds = this.bkgVideo.getBounds();

    if(this.skipButton) {
      this.skipButton.multiplierResize(multiplier);
      this.skipButton.position.set(size.width - 10 * multiplier, size.height - 10 * multiplier);
    }

    if(this.conductToggleButton) {
      this.conductToggleButton.multiplierResize(multiplier);
      this.conductToggleButton.position.set(size.width - 10 * multiplier, size.height - 10 * multiplier);
    }

    this.interactivesContainer.position.set(
      (size.width - bounds.width) / 2,
      videoBounds.bottom - bounds.height * 0.30);

    PerformanceState.dragSpawn.multiplierResize(multiplier);

    PerformanceState.dragSpawn.setOrigin(
      this.interactivesContainer.position.x + multiplier * this.centerStage[0],
      this.interactivesContainer.position.y + multiplier * this.centerStage[1],
    );

    this.foregroundEnvironment.multiplierResize(multiplier);
    this.backgroundEnvironment.multiplierResize(multiplier);

    this.foregroundEnvironment.position.y = size.height;
    this.backgroundEnvironment.position.y = this.interactivesContainer.position.y + multiplier * 80;

  }

  async cleanUp() {

  }

}