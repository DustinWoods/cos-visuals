import { Container, Application, Text, Sprite, BLEND_MODES, Loader } from "pixi.js";
import State from "./state";
import { TEXT_STYLE_BUTTON, TEXT_STYLE_BUTTON_HOVER } from "./styles";
import logoUrl from '../assets/images/logo.png';
import titleBkgUrl from '../assets/images/title-bkg.jpg';

export default class TitleState extends State {
  static qualitySelected: string = '';
  private playButton: Text;
  private optionButtons: [Text, string][];
  private logo: Sprite;
  private bkg: Sprite;
  async createContainer(app: Application): Promise<Container> {

    const container = new Container();

    await new Promise((resolve) => {
      if(Loader.shared.resources[titleBkgUrl]) return resolve();
      Loader.shared.add(titleBkgUrl).load(resolve);
    });
    await new Promise((resolve) => {
      if(Loader.shared.resources[logoUrl]) return resolve();
      Loader.shared.add(logoUrl).load(resolve);
    });

    this.bkg = Sprite.from(titleBkgUrl);
    this.bkg.alpha = 0.5;
    this.bkg.anchor.set(0.5, 0.5);
    this.logo = Sprite.from(logoUrl);
    this.logo.anchor.set(0.5, 0);

    container.addChild(this.bkg);
    container.addChild(this.logo);

    this.optionButtons = [
      [new Text("1080p HD (170 MB)", TEXT_STYLE_BUTTON), "1080"],
      [new Text("720p (97 MB)", TEXT_STYLE_BUTTON), "720"],
      [new Text("360p (30 MB)", TEXT_STYLE_BUTTON), "360"],
    ];

    this.optionButtons.forEach(([text, optionArg], i, a) => {
      text.visible = false;
      text.interactive = false;
      text.anchor.set(0.5, 0);
      text.cursor = "pointer";
      text.on("mouseover", () => text.style = TEXT_STYLE_BUTTON_HOVER);
      text.on("mouseout", () => text.style = TEXT_STYLE_BUTTON);
      container.addChild(text);
      text.on("pointertap", () => {
        TitleState.qualitySelected = optionArg;
        this.events.get("complete").dispatch(this, optionArg);
      });
    });

    this.playButton = new Text("PLAY", TEXT_STYLE_BUTTON);
    this.playButton.anchor.set(0.5, 0);
    container.interactive = true;
    container.cursor = "pointer";
    container.on("mouseover", () => {
      //app.renderer.backgroundColor = 0x111111;
      this.playButton.style = TEXT_STYLE_BUTTON_HOVER;
    });
    container.on("mouseout", () => {
      app.renderer.backgroundColor = 0x000000;
      this.playButton.style = TEXT_STYLE_BUTTON ;
    });
    container.on("pointertap", () => {
      container.removeChild(this.playButton);
      container.interactive = false;
      container.cursor = "auto";
      this.bkg.alpha = 0.2;
      this.logo.alpha = 0;
      if(TitleState.qualitySelected) {
        this.events.get("complete").dispatch(this, TitleState.qualitySelected);
      } else {
        this.optionButtons.forEach(([text, optionArg], i, a) => {
          text.visible = true;
          text.interactive = true;
        });
      }
    });
    container.addChild(this.playButton);

    app.renderer.backgroundColor = 0x000000;

    return container;
  }

  onResize(size: {width: number, height: number}) {

    let paddTop = 0;
    if(!document.fullscreenElement) {
      const nav = document.getElementsByTagName("nav");
      if(nav && nav[0]) {
        const {y,height} = nav[0].getBoundingClientRect();
        paddTop = y + height;
      }
    }

    const scale = Math.min(1, size.width / 1529);
    this.logo.scale.set(scale);
    this.logo.position.set(size.width/2, paddTop + 10 * scale);
    const logoBounds = this.logo.getBounds();

    const bottomMost = logoBounds.bottom;
    const centerBottom = Math.max(bottomMost, paddTop + (size.height - paddTop)/2);

    this.bkg.scale.set(scale);
    this.bkg.position.set(size.width/2, centerBottom);
    this.playButton.scale.set(scale);
    this.playButton.position.set(size.width/2, centerBottom);

    this.optionButtons.forEach(([text], i, a) => {
      text.scale.set(scale);
      text.position.set(size.width/2, centerBottom + scale * 60 *(i - a.length/2));
    });
  }

  async cleanUp() {

  }

}