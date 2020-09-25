import './css/styles.css';
import { Application } from 'pixi.js';
import { loadFonts } from './styles';
import { StateMachine } from './state-machine';
import navLinks from './nav-links.json';

window.onload = async () => {

  await Promise.all([
    loadFonts(),
  ]);

  const app = new Application({
    antialias: true,
    transparent: false,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
    resizeTo: window,
    backgroundColor: 0x000000,
  });

  const resizeCanvas = () => {
    app.renderer.resolution = window.devicePixelRatio;
    app.resize();
  }
  // Change resolution if changes
  window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    .addEventListener("change", resizeCanvas);
  window.addEventListener("orientationchange", resizeCanvas);

  document.body.appendChild(app.view);

  const footer = document.createElement('nav');
  const links = Object.entries(navLinks).map(([label, url]) => {
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('title', url.replace(/^.*:\/\//,'').replace(/^mailto:/,''));
    a.innerText = label;
    return a;
  });
  links.forEach((link) => footer.appendChild(link));
  document.body.appendChild(footer);

  const stateManager = new StateMachine(app);

};