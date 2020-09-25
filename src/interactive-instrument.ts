import { Graphics, Point, InteractionEvent, BLEND_MODES } from "pixi.js";
import { Interactive } from "./interactive";
import { Draggable, DraggableState } from "./draggable";
import { powLerpPoint } from "./lerp";
import { DRAGGABLE_RADIUS } from "./constants";
import { MotionFn } from "./tracks/main/instrument-motion-fn";
import { decimalTorgb, saturateColor } from "./color-utils";
import { COLOR_HALL_HIGHLIGHT } from "./colors";

export enum InstrumentState {
  IDLE,
  CUE_READY,
  CUED,
  HIT,
  HIT_SUCCESS,
}

export class InteractiveInstrument extends Interactive {
  private bkgGraphics: Graphics = new Graphics();
  private indicatorPoint: Point = new Point();
  private indicatorStartPoint: Point = new Point();
  private indicatorEndPoint: Point = new Point();
  private draggables: Array<Draggable> = [];
  private mCenterPoint: Point = new Point();
  private needDraw = true;
  private currentColor: number = 0x000000;
  private _highlightColor: number = COLOR_HALL_HIGHLIGHT;
  private _outlineThickness: number = 0;
  private _partyTime = false;

  public state: InstrumentState = InstrumentState.IDLE;
  public stateValue?: any = 0;
  private nextCueData?: {
    spriteUrl: string,
    motionFn: MotionFn
  };

  constructor(private idleColor: number, private graphicsDraw: () => void) {
    super();

    this.color = idleColor;

    this.draw();

    this.interactive = true;
    this.cursor = "auto";
    this.on("drop", this.onDrop.bind(this));
    this.on("mousedragover", this.onDragOver.bind(this));
    this.on("pointertap", this.maybeSpawn.bind(this));

    this.addChild(this.bkgGraphics);
  }

  set blendBkg(y: boolean) {
    if(y) {
      this.bkgGraphics.blendMode = BLEND_MODES.MULTIPLY;
      this.bkgGraphics.alpha = 0.8;
    } else {
      this.bkgGraphics.blendMode = BLEND_MODES.NORMAL;
      this.bkgGraphics.alpha = 1;
    }
  }

  set highlightColor(c: number) {
    this._highlightColor = c;
    if(this.state == InstrumentState.CUE_READY) {
      this.color = this._highlightColor;
      this.needDraw = true;
    }
  }

  set color(c: number) {
    if(this.currentColor !== c) {
      this.currentColor = c;
      this.needDraw = true;
    }
  }

  set outlineThickness(t: number) {
    if(this._outlineThickness !== t) {
      this._outlineThickness = t;
      this.needDraw = true;
    }
  }

  multiplierResize(multiplier: number) {
    this.scale.set(multiplier,multiplier);

    const bkgBounds = this.bkgGraphics.getLocalBounds();
    this.mCenterPoint.set(bkgBounds.x + bkgBounds.width / 2, bkgBounds.y + bkgBounds.height / 2  - DRAGGABLE_RADIUS);
  }

  maybeSpawn(e: InteractionEvent) {
    if(this.state === InstrumentState.CUE_READY) {
      this.emit("maybeSpawn", this, e);
    }
  }

  onDragOver(e: InteractionEvent) {
    super.onDragOver(e);
    const dragging = <Draggable>arguments[1];
    if(dragging && this.state === InstrumentState.CUE_READY) {
      dragging.onDragEnd.call(dragging, e);
    }
  }

  onDrop(dragging: Draggable, e?: InteractionEvent) {
    if(this.state === InstrumentState.CUE_READY && !this.draggables.length) {
      const thisGlobPosition = this.getGlobalPosition();
      const dragParentGlobal = dragging.parent.getGlobalPosition();
      const dragParentOffset = new Point((dragParentGlobal.x - thisGlobPosition.x) / this.scale.x, (dragParentGlobal.y - thisGlobPosition.y) / this.scale.y);
      dragging.adopt(this);
      if(this._partyTime) {
        dragging.partyTime();
      }
      this.draggables.push(dragging);
      dragging.on("destroy", () => {
        const f = this.draggables.findIndex((d) => d === dragging);
        this.draggables.splice(f, 1);
        dragging.abandon();
      });
      this.setState(InstrumentState.CUED);
      this.indicatorStartPoint.copyFrom(dragging.position);

      this.indicatorEndPoint.x = this.mCenterPoint.x - dragParentOffset.x;
      this.indicatorEndPoint.y = this.mCenterPoint.y - dragParentOffset.y;
    }
  }

  setState(newState: InstrumentState, value?: any, cue?: number) {
    if(newState === this.state) return;

    switch (newState) {
      case InstrumentState.CUED:
        this.stateFadeTime = 1.0;
        this.cursor = "auto";
        //this.color = this.idleColor;
        this.outlineThickness = 4;
        if(this.nextCueData && this.draggables.length) {
          this.draggables[0].icon = this.nextCueData.spriteUrl;
          this.draggables[0].motionFn = this.nextCueData.motionFn;
        }
        break;

      case InstrumentState.CUE_READY:
        this.stateFadeTime = 1.0;
        this.cursor = "pointer";
        this.color = this._highlightColor;
        this.outlineThickness = 0;
        if(typeof value === 'object') {
          this.nextCueData = value;
        }
        break;

      case InstrumentState.HIT:
        this.stateFadeTime = 0.5;
        this.cursor = "auto";
        //this.color = this.idleColor;
        this.outlineThickness = 0;
        if(this.state === InstrumentState.CUED){
          newState = InstrumentState.HIT_SUCCESS;
          this.emit("score", cue);
          this.stateFadeTime = 0.1;
        }
        if(this.draggables.length) {
          if(value && typeof value === "object" && value.length) {
            this.draggables[0].setVisualCues(value);
            this.draggables[0].accentColor = decimalTorgb(this._highlightColor);
          } else {
            this.draggables[0].setState(DraggableState.SHRINK_OUT, 0.5);
          }
        }
        break;

      default:
        //this.color = this.idleColor;
        this.cursor = "auto";
        this.outlineThickness = 0;
        this.stateFadeTime = 1;
    }
    this.stateFade = 0;
    this.state = newState;
    this.stateValue = value;
  }

  partyTime() {
    this._partyTime = true;
    this.draggables.forEach((d) => d.partyTime());
  }

  onTick(currentBeat: number, deltaBeat: number) {
    super.onTick(currentBeat, deltaBeat);

    this.draggables.forEach((d) => d.onTick(currentBeat, deltaBeat));

    if(this.state === InstrumentState.CUE_READY) {
      if(this.stateFade >= 1) {
        this.alpha = 1;
      } else {
        this.alpha = this.stateFade;
      }
    }

    if(this.state === InstrumentState.CUE_READY && this.dragHover) {
      this.outlineThickness = 2;
    } else if(this.state === InstrumentState.CUE_READY) {
      this.outlineThickness = 0;
    }

    if(this.state === InstrumentState.HIT || this.state === InstrumentState.HIT_SUCCESS) {
      if(this.stateFade >= 1) {
        this.alpha = 0;
        this.setState(InstrumentState.IDLE);
      } else {
        this.alpha = 1 - this.stateFade;
      }
    }

    if(this.state === InstrumentState.CUED) {
      if(this.stateFade < 1) {
        this.indicatorPoint.copyFrom(powLerpPoint(this.indicatorStartPoint, this.indicatorEndPoint, this.stateFade, 0.1));
      } else {
        this.indicatorPoint.copyFrom(this.indicatorEndPoint);
      }
      if(this.draggables[0]) {
        this.draggables[0].position.copyFrom(this.indicatorPoint);
      }
      //this.indicatorGraphics.position.set(this.mCenterPoint.x + this.indicatorPoint.x, this.mCenterPoint.y + this.indicatorPoint.y);
    } else if (this.state === InstrumentState.HIT_SUCCESS) {
      //
    } else {
      //
    }

    if(this.state === InstrumentState.IDLE) {
      if(this.stateFade >= 1) {
        this.alpha = 1 - this.stateFade;
      } else {
        this.alpha = 0;
      }
    }

    if(this.needDraw) {
      this.draw();
    }
  }


  draw() {
    this.needDraw = false;
    let c2 = saturateColor(this.currentColor);
    this.bkgGraphics.clear().beginFill(c2, 1);
    this.graphicsDraw.apply(this.bkgGraphics);
    this.bkgGraphics.endFill();
  }
}