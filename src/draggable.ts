import { Graphics, Point, Sprite, BLEND_MODES, Container, DisplayObject, InteractionEvent, filters } from "pixi.js";
import { Interactive } from "./interactive";
import { DRAGGABLE_RADIUS } from "./constants";
import bloomImage from '../assets/images/bloom-128x128.png';
import ClickTrack from "click-track";
import OnDemandEmitter from "./on-demand-emitter";

import note_16DotDown from '../assets/images/note-notations/16-dot-down.svg';
import note_16DotUp from '../assets/images/note-notations/16-dot-up.svg';
import note_16Down from '../assets/images/note-notations/16-down.svg';
import note_16Up from '../assets/images/note-notations/16-up.svg';
import note_2DotDown from '../assets/images/note-notations/2-dot-down.svg';
import note_2DotTremDown from '../assets/images/note-notations/2-dot-trem-down.svg';
import note_2DotTremUp from '../assets/images/note-notations/2-dot-trem-up.svg';
import note_2DotUp from '../assets/images/note-notations/2-dot-up.svg';
import note_2Down from '../assets/images/note-notations/2-down.svg';
import note_2TremDown from '../assets/images/note-notations/2-trem-down.svg';
import note_2TremUp from '../assets/images/note-notations/2-trem-up.svg';
import note_2Up from '../assets/images/note-notations/2-up.svg';
import note_32Down from '../assets/images/note-notations/32-down.svg';
import note_32Up from '../assets/images/note-notations/32-up.svg';
import note_4DotDown from '../assets/images/note-notations/4-dot-down.svg';
import note_4DotTremDown from '../assets/images/note-notations/4-dot-trem-down.svg';
import note_4DotTremUp from '../assets/images/note-notations/4-dot-trem-up.svg';
import note_4DotUp from '../assets/images/note-notations/4-dot-up.svg';
import note_4Down from '../assets/images/note-notations/4-down.svg';
import note_4TremUp from '../assets/images/note-notations/4-trem-up.svg';
import note_4Up from '../assets/images/note-notations/4-up.svg';
import note_8DotDown from '../assets/images/note-notations/8-dot-down.svg';
import note_8DotUp from '../assets/images/note-notations/8-dot-up.svg';
import note_8Down from '../assets/images/note-notations/8-down.svg';
import note_8TremDown from '../assets/images/note-notations/8-trem-down.svg';
import note_8TremUp from '../assets/images/note-notations/8-trem-up.svg';
import note_8Up from '../assets/images/note-notations/8-up.svg';

const noteImages = [
  note_32Up,
  note_32Down,
  note_16DotUp,
  note_16DotDown,
  note_16Up,
  note_16Down,
  note_8Up,
  note_8Down,
  note_8TremUp,
  note_8TremDown,
  note_8DotUp,
  note_8DotDown,
  note_4Up,
  note_4Down,
  note_4TremUp,
  note_4DotUp,
  note_4DotDown,
  note_4DotTremUp,
  note_4DotTremDown,
  note_2Up,
  note_2Down,
  note_2TremDown,
  note_2TremUp,
  note_2DotUp,
  note_2DotDown,
  note_2DotTremUp,
  note_2DotTremDown,
];

const whichNoteIcon = (a: NoteAttributes): string => {
  switch (a.duration) {
    case 0.2708: //- (close enough) thirty second
    case 0.25: //thirty second
      if(a.stem && a.stem < 0) return note_32Down;
      return note_32Up;
    break;

    case 0.2875: // (close enough) sixteenth
    case 0.3: // (close enough) sixteenth
    case 0.3333: // (close enough) sixteenth
    case 0.5: //sixteenth
      if(a.stem && a.stem < 0) return note_16Down;
      return note_16Up;
    break;

    case 0.75: //dotted sixteenth
      if(a.stem && a.stem < 0) return note_16DotDown;
      return note_16DotUp;
    break;


    case 0.6667: // (close enough) eighth
    case 1.0917: // (close enough) eighth
    case 1.2: // (close enough) eighth
    case 1: //eighth
      if(a.isTremelo) {
        if(a.stem && a.stem < 0) return note_8TremDown;
        return note_8TremUp;
      }
      if(a.stem && a.stem < 0) return note_8Down;
      return note_8Up;
    break;

    case 1.5: //dotted eighth
      if(a.stem && a.stem < 0) return note_8DotDown;
      return note_8DotUp;
    break;

    case 2: //quarter
      if(a.isTremelo) {
        return note_4TremUp;
      }
      if(a.stem && a.stem < 0) return note_4Down;
      return note_4Up;
    break;

    case 3: //dotted quarter
      if(a.isTremelo) {
        if(a.stem && a.stem < 0) return note_4DotTremDown;
        return note_4DotTremUp;
      }
      if(a.stem && a.stem < 0) return note_4DotDown;
      return note_4DotUp;
    break;

    case 4: //half
      if(a.isTremelo) {
        if(a.stem && a.stem < 0) return note_2TremDown;
        return note_2TremUp;
      }
      if(a.stem && a.stem < 0) return note_2Down;
      return note_2Up;
    break;

    case 6: //dotted half
      if(a.isTremelo) {
        if(a.stem && a.stem < 0) return note_2DotTremDown;
        return note_2DotTremUp;
      }
      if(a.stem && a.stem < 0) return note_2DotDown;
      return note_2DotUp;
    break;

    default:
      // The mose basic of all notes;
      return note_4Up;
  }
};

import { PathParticle } from "pixi-particles";
import PerformanceState from "./performance-state";
import { rgbToDecimal } from "./color-utils";
import { MotionFn } from "./tracks/main/instrument-motion-fn";
import { linearLerpVec3 } from "./lerp";

export enum DraggableState {
  HIDDEN,
  IDLE,
  SHRINK_OUT,
  SHRINK_IN
}

type NoteAttributes = {
  pitch?: number | null;
  words?: string;
  duration?: number;
  isTremelo?: boolean;
  isCrescendo?: boolean;
  stem?: number;
  iconIndex?: number;
};

export class Draggable extends Interactive {
  protected graphics: DisplayObject = new Graphics();
  protected dragging = false;
  public origin: Point = new Point();
  protected state: DraggableState;
  protected lastPosition: Point = new Point();
  protected pointerPos: Point;
  protected velocity: [number, number];
  protected velocityMeasurements: Array<[number, number]> = [];
  protected lastBeat: number = 0;
  protected visualCuesClicktrack: ClickTrack<NoteAttributes>;
  protected visualCuesEmitter: OnDemandEmitter;
  private bloomSprite: Sprite;
  public motionFn: MotionFn;
  private _colorFrom: [number, number, number] = [1,1,1];
  private _currentColor: [number, number, number] = [1,1,1];
  private _accentColor: [number, number, number] = [1,1,1];
  private _color_timer: number = 0;
  private currentNoteAttributes: NoteAttributes;
  private currentCuedNote: number;
  private currentCuedPhraseStartBeat: number;
  private currentCuedPhraseDuration: number;
  private currentCuedPhraseEndBeat: number;
  private colorMatrix = new filters.ColorMatrixFilter();

  constructor() {
    super();
    (this.graphics as Graphics)
      .clear()
      .beginFill(0xffffff, 1)
      .drawCircle(0, 0, DRAGGABLE_RADIUS)
      .endFill();
    this.addChild(this.graphics);

    this.bloomSprite = Sprite.from(bloomImage);
    this.bloomSprite.scale.set(0.7);
    this.bloomSprite.blendMode = BLEND_MODES.SOFT_LIGHT;
    this.bloomSprite.anchor.set(0.5, 0.5);
    this.setState(DraggableState.SHRINK_IN, 1.0);

    this.addChild(this.bloomSprite);

    this.graphics.interactive = true;
    this.graphics.cursor = "grab";
    this.graphics
      .on('pointerdown', this.onDragStart.bind(this))
      .on('pointerup', this.onDragEnd.bind(this))
      .on('pointerupoutside', this.onDragEnd.bind(this));

    this.filters = [this.colorMatrix];
  }

  adopt(newParent: Container) {
    this.emit('adopted', this, newParent);
    this.setState(DraggableState.SHRINK_IN, 0);
    this.velocity = [0,0];
  }

  abandon() {
    if(this.parent) {
      this.parent.removeChild(this);
    }
    this.destroy();
  }

  setOrigin(x: number, y: number) {
    this.origin.x = x;
    this.origin.y = y;
    this.position.set(x, y);
  }

  onDragStart(e: InteractionEvent) {
    this.dragging = true;
    this.graphics.cursor = "grabbing";
    this.emit("dragActive", this, e);
    this.graphics.on('pointermove', this.onDragMove.bind(this));
    document.body.classList.add("dragging");
  }

  onDragEnd(e: InteractionEvent) {
    this.dragging = false;
    this.graphics.cursor = "auto";
    this.emit("dragInactive", this, e);
    this.graphics.off('pointermove', this.onDragMove.bind(this));
    this.emit("dragged", this, e);
    document.body.classList.remove("dragging");
  }

  onDragMove(e: InteractionEvent) {
    if (this.dragging) {
      const newPosition = e.data.getLocalPosition(this.parent);
      this.pointerPos = new Point();
      this.pointerPos.copyFrom(newPosition);
    }
  }

  onTick(beat: number, deltaBeat: number) {
    super.onTick(beat, deltaBeat);

    if(this._destroyed) return;

    if(this.visualCuesEmitter) {
      this.visualCuesEmitter.update(deltaBeat);
    }

    if(this.pointerPos && this.dragging) {
      this.lastPosition.copyFrom(this.position);
      this.position.copyFrom(this.pointerPos);
      const velMeasurement: [number, number] = [(this.position.x - this.lastPosition.x) / deltaBeat, (this.position.y - this.lastPosition.y) / deltaBeat];
      this.velocityMeasurements.push(velMeasurement);
      // keep measurements to 5
      if(this.velocityMeasurements.length > 10) {
        this.velocityMeasurements.shift();
      }
      // Calculate avg velocity from samples
      this.velocity = [0,0];
      for (let i = 0; i < this.velocityMeasurements.length; i++) {
        this.velocity[0] += this.velocityMeasurements[i][0];
        this.velocity[1] += this.velocityMeasurements[i][1];
      }
      this.velocity[0] = this.velocity[0] / this.velocityMeasurements.length;
      this.velocity[1] = this.velocity[1] / this.velocityMeasurements.length;
    }

    const ydiff = (this.position.y - this.origin.y);
    const perspectivescale = Math.pow(2, ydiff / 200);
    this.scale.set(perspectivescale, perspectivescale);

    if(this.state === DraggableState.SHRINK_OUT) {
      this.position.set(this.position.x + this.velocity[0] * deltaBeat / 2, this.position.y + this.velocity[1] * deltaBeat / 2);
      this.graphics.scale.set(1 - this.stateFade);
      this.alpha = 1 - this.stateFade;
      if(this.stateFade >= 1) {
        this.emit("destroy", this);
      }
    }

    if(this.state === DraggableState.SHRINK_IN) {
      this.graphics.scale.set(this.stateFade);
      this.alpha = this.stateFade;
      if(this.stateFade >= 1) {
        this.setState(DraggableState.IDLE, 1.0);
      }
    }

    if(this.visualCuesClicktrack && this.currentNoteAttributes && this.motionFn) {
      const currentNoteOptions = {
        beat: this.visualCuesClicktrack.beat,
        noteProgress: Math.max(0, beat - this.currentCuedNote),
        noteDuration: this.currentNoteAttributes.duration ? this.currentNoteAttributes.duration : 0,
        phraseProgress: this.visualCuesClicktrack.beat - this.currentCuedPhraseStartBeat,
        phraseDuration: this.currentCuedPhraseDuration,
        pitch: this.currentNoteAttributes.pitch,
        isTremelo: this.currentNoteAttributes.isTremelo,
        isCrescendo: this.currentNoteAttributes.isCrescendo
      };
      if(this.motionFn.x)
        this.graphics.position.x = this.motionFn.x(currentNoteOptions);
      if(this.motionFn.y)
        this.graphics.position.y = this.motionFn.y(currentNoteOptions);
      if(this.motionFn.t)
        this.graphics.rotation = this.motionFn.t(currentNoteOptions);
    }

    if(this.visualCuesClicktrack) {
      if(this._color_timer > 0) {
        this._color_timer -= deltaBeat / 10;
        if(this._color_timer <= 0) this._color_timer = 0;
        this._currentColor = linearLerpVec3(this._colorFrom, this._accentColor, 1 - this._color_timer);

        this.colorMatrix.matrix = [
          this._currentColor[0],0,0,0,0,
          0,this._currentColor[1],0,0,0,
          0,0,this._currentColor[2],0,0,
          0,0,0,1,0,
        ];
      }
      if(beat > this.currentCuedPhraseEndBeat) {
        this.visualCuesClicktrack.deconstruct();
        delete this.visualCuesClicktrack;
        this.setState(DraggableState.SHRINK_OUT, 0.1);
      }
    }
  }

  set accentColor(color: [number, number, number]) {
    this._colorFrom = this._currentColor;
    this._accentColor = color;
    this._color_timer = 1;
  }

  set icon(icon: string) {
    this.graphics.destroy();
    this.graphics = Sprite.from(icon);
    (<Sprite>this.graphics).anchor.set(0.5);
    this.addChild(this.graphics);

    const scale = 1;
    this.graphics.scale.set(scale);
    this.bloomSprite.visible = false;
  }

  setVisualCues(cues: [number, NoteAttributes][], parentClick?: ClickTrack) {

    if(this.visualCuesClicktrack) {
      throw new Error("Can't set the visual cues again");
    }

    const cuesB = cues.map<[number, NoteAttributes]>((a) => {
      return [a[0],
        {
          ...a[1],
          iconIndex: noteImages.indexOf(whichNoteIcon(a[1]))
        }
      ]
    });

    // Dirty way for testing until better decoupled
    if(parentClick) {
      this.visualCuesClicktrack = new ClickTrack<NoteAttributes>({
        timerSource: parentClick.timer,
        offset: parentClick.offset,
        tempo: parentClick.tempo,
        cues: cuesB
      });
    } else {
      this.visualCuesClicktrack = new ClickTrack<NoteAttributes>({
        timerSource: PerformanceState.clickTrack.timer,
        offset: PerformanceState.clickTrack.offset,
        tempo: PerformanceState.clickTrack.tempo,
        cues: cuesB
      });
    }

    this.currentCuedPhraseStartBeat = cues[0][0];
    this.currentCuedPhraseEndBeat = cues[cues.length - 1][0] + (cues[cues.length - 1][1].duration || 0);
    this.currentCuedPhraseDuration = this.currentCuedPhraseEndBeat - this.currentCuedPhraseStartBeat;

    const spawnSpread = 5;
    const color = "#" + rgbToDecimal([Math.random(),Math.random(),Math.random()]).toString(16).padStart(6,"0");
    // This config is temp, need to move to setter
    this.visualCuesEmitter = new OnDemandEmitter(
      this,
      noteImages, {
        "alpha": {
          list: [
            {
              time: 0,
              value: 0
            },
            {
              time: 0.2,
              value: 0.9
            },
            {
              time: 0.8,
              value: 0.8
            },
            {
              time: 1,
              value: 0
            }
          ],
          isStepped: false
        },
        "scale": {
          "start": 0.6,
          "end": 0.6,
          "minimumScaleMultiplier": 0.5
        },
        "color": {
          list: [
            {
              time: 0,
              value: "#ffffff",
            },
            {
              time: 0.2,
              value: "#999999 ",
            },
            {
              time: 0.4,
              value: "#ffffff",
            },
            {
              time: 0.6,
              value: "#999999 ",
            },
            {
              time: 0.8,
              value: "#ffffff",
            },
            {
              time: 1.0,
              value: "#999999 ",
            },
          ],
          isStepped: false
        },
        "speed": {
          "start": 12,
          "end": 5,
          "minimumSpeedMultiplier": 1
        },
        "acceleration": {
          "x": 0,
          "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
          "min": -90-spawnSpread,
          "max": -90+spawnSpread
        },
        "noRotation": true,
        "rotationSpeed": {
          "min": 0,
          "max": 0
        },
        "lifetime": {
          "min": 24,
          "max": 24
        },
        "blendMode": "normal",
        "extraData": {
          "path":"sin(x/30 + " + Math.floor(Math.random()*8)/4 + "*PI) * 10"
        },
        "frequency": 0.01,
        "particlesPerWave": 1,
        "emitterLifetime": -1,
        "maxParticles": 15,
        "pos": {
          "x": 0,
          "y": 0
        },
        "addAtBack": false,
        "spawnType": "ring",
        "spawnCircle": {
          "x": 0,
          "y": 0,
          "r": 48,
          "minR": 48
        }
      }
    );

    this.visualCuesEmitter.particleConstructor = PathParticle;

    this.visualCuesClicktrack.on("cue", (ct, e) => {
      if(e.data) {
        this.currentCuedNote = e.beat;
        this.currentNoteAttributes = {...e.data};
        if(e.data.duration) {
          this.visualCuesEmitter.spawn(1, e.drag, e.data.iconIndex);
        }
      }
    });

  }

  multiplierResize(m: number) {}

  setState(newState: DraggableState, value: number) {
    if(newState === DraggableState.SHRINK_OUT) {
      this.stateFadeTime = value;
      this.stateFade = 1 - this.graphics.scale.x;
    }
    if(newState === DraggableState.SHRINK_IN) {
      this.stateFadeTime = 0.5;
      this.stateFade = 1 - this.graphics.scale.x;
    }
    this.state = newState;
  }

}