const fs = require('fs').promises;
const { DOMParser } = require('xmldom');
const canvasJs = require('canvas');
const fetch = require('node-fetch');
const Canvg = require('canvg').Canvg;
const presets = require('canvg').presets;
const getOptions = require('loader-utils').getOptions;
const cheerio = require('cheerio');


module.exports = async function (content) {
  const callback = this.async();

  const $ = cheerio.load(content);
  const viewBox = $('svg').attr('viewBox');

  try {
    let {
      width,
      height,
      multiplier =  1,
    } = getOptions(this);

    if(viewBox && (!width && !height)) {
      const parts = viewBox.split(" ").map(s => parseFloat(s));
      width = parts[2] - parts[0];
      height = parts[3] - parts[1];
    }

    const preset = presets.node({
      DOMParser,
      canvas: canvasJs,
      fetch,
      scaleWidth: multiplier,
      scaleHeight: multiplier,
    });

    const canvas = preset.createCanvas(parseInt(width) * multiplier, parseInt(height) * multiplier);
    const ctx = canvas.getContext('2d');

    const v = Canvg.fromString(ctx, content, preset);

    // Render only first frame, ignoring animations.
    await v.render();

    const png = canvas.toBuffer();

    callback(null, png);
  } catch (e) {
    callback(e);
  }
}