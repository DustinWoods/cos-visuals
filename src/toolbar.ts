import { Container, Text } from "pixi.js";
import { FancyViewport } from "./fancy-viewport";
import { TEXT_STYLE_H2 } from "./styles";

export class Toolbar extends Container {
  constructor(viewport: FancyViewport, canvas: HTMLCanvasElement, ) {
    super();
    const snapCenterButt = new Text("[C]", TEXT_STYLE_H2);
    snapCenterButt.interactive = true;
    snapCenterButt.on("pointertap", () => {
      viewport.transitionCenter(0,0);
    });
    snapCenterButt.scale.set(5, 5);
    snapCenterButt.anchor.set(0, 0);
    this.addChild(snapCenterButt);
    snapCenterButt.position.set(0, 0);

    const fullScreenButt = new Text("[F]", TEXT_STYLE_H2);
    fullScreenButt.interactive = true;
    fullScreenButt.on("pointertap", () => {
      if(document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        canvas.requestFullscreen();
      }
    });
    fullScreenButt.scale.set(5, 5);
    fullScreenButt.anchor.set(1, 0);
    this.addChild(fullScreenButt);
    fullScreenButt.position.set(window.innerWidth, 0);
  }
}