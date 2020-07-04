import { Graphics, Point } from "pixi.js";
import { Interactive } from "./interactive";
import { DRAGGABLE_RADIUS } from "./constants";
import { Draggable, DraggableState } from './draggable';
import ArrowGraphic from "./arrow-graphic";

export class DraggableSpawn extends Interactive {
  protected graphics: Graphics = new Graphics();
  protected dragging = false;
  public origin: Point = new Point();
  private multiplier: number = 1.0;
  public isDragging = false;
  private draggingObject?: Draggable;
  protected firstArrow: ArrowGraphic;

  constructor() {
    super();
    this.spawnDraggable();

    this.firstArrow = new ArrowGraphic([-52, -26],[-100,-50]);
    this.addChild(this.firstArrow);

  }

  spawnDraggable() {
    if(this.draggingObject) {
      // Just in case, let's make sure we don't have listeners on an old draggable
      this.draggingObject.off('dragActive', this.onActiveDrag.bind(this));
      this.draggingObject.off('dragInactive', this.onInctiveDrag.bind(this));
      this.draggingObject.off('adopted', this.onAdopted.bind(this));
    }
    this.draggingObject = new Draggable();
    this.addChild(this.draggingObject);
    this.draggingObject.position.set(0,0);
    //this.draggingObject.multiplierResize(this.multiplier);
    this.draggingObject.on('dragActive', this.onActiveDrag.bind(this));
    this.draggingObject.on('dragInactive', this.onInctiveDrag.bind(this));
    this.draggingObject.on('dragged', this.onDragged.bind(this));
    this.draggingObject.on('adopted', this.onAdopted.bind(this));
    this.draggingObject.on('destroy', this.onDestroy.bind(this));
  }

  onDestroy(dragging: Draggable) {
    dragging.abandon();
  }

  onAdopted(dragging: Draggable) {
    dragging.off('destroy', this.onDestroy.bind(this));
    this.spawnDraggable();
  }

  onActiveDrag(dragging: Draggable, e: PIXI.interaction.InteractionEvent) {
    this.isDragging = true;
  }

  onDragged(dragging: Draggable, e: PIXI.interaction.InteractionEvent) {
    this.emit('dragged', dragging, e);
  }

  onInctiveDrag(dragging: Draggable, e: PIXI.interaction.InteractionEvent) {
    this.isDragging = false;
    setImmediate(this.checkKill.bind(this));
  }

  checkKill() {
    if(!this.isDragging && this.draggingObject) {
      const distanceFromCenter = this.draggingObject.position.x * this.draggingObject.position.x + this.draggingObject.position.y * this.draggingObject.position.y;
      if(distanceFromCenter < 100 * 100 * this.multiplier) {
        this.draggingObject.position.set(0,0);
      } else {
        this.draggingObject.setState(DraggableState.SHRINK_OUT, 0.5);
        this.spawnDraggable();
      }
    }
  }

  setOrigin(x: number, y: number) {
    this.origin.x = x;
    this.origin.y = y;
    this.position.set(x, y);
  }

  multiplierResize(multiplier: number) {
    this.multiplier = multiplier;
    this.scale.set(multiplier);
  }

  onTick(beat: number, deltaBeat: number) {
    if(this.children) {
      this.children.forEach((maybeDraggable) => {
        if(maybeDraggable instanceof Draggable) {
          maybeDraggable.onTick(beat, deltaBeat);
        }
      });
    }

    if(this.firstArrow) {
      this.firstArrow.tick(deltaBeat);
    }

  }

  setState(newState: DraggableState, value: number) {
    //
  }

}