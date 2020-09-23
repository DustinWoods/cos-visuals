
export function hue2rgb(p: number, q: number, t: number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function hslToRgb(h: number, s: number, l: number) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {


    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return r * 255 * Math.pow(256, 2) + g * 255 * 256 + b * 255;
}

export function rgbToDecimal([r, g, b]: [number, number, number]) {
  return Math.round(b * 255) + (Math.round(g * 255) << 8) + (Math.round(r * 255) << 16);
}

export function decimalTorgb(color: number): [number, number, number] {
  let r = color >> 16;
  color -= r << 16;
  let g = color >> 8;
  color -= g << 8;
  let b = color;

  return [r/255,g/255,b/255];
}

export function saturateColor(color) {
  let c = decimalTorgb(color);
  let chsv = RGBtoHSV(c);
  chsv[1] += 0.8;
  if(chsv[1] > 1) chsv[1] = 1; else if(chsv[1] < 0) chsv[1] = 0;
  let chsl = HSVtoHSL(chsv);
  chsl[2] += 0.2;
  if(chsl[2] > 1) chsl[2] = 1; else if(chsl[2] < 0) chsl[2] = 0;
  chsv = HSLtoHSV(chsl);
  return rgbToDecimal(HSVtoRGB(chsv));
}

export function RGBtoHSV([r, g, b]): [number, number, number] {
  var max = Math.max(r, g, b), min = Math.min(r, g, b),
      d = max - min,
      h,
      s = (max === 0 ? 0 : d / max),
      v = max;

  switch (max) {
      case min: h = 0; break;
      case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
      case g: h = (b - r) + d * 2; h /= 6 * d; break;
      case b: h = (r - g) + d * 4; h /= 6 * d; break;
  }

  return [
      h,
      s,
      v
  ];
}

export function HSVtoRGB([h, s, v]): [number, number, number] {
  var r, g, b, i, f, p, q, t;

  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return [
      r,
      g,
      b
  ];
}

export function HSVtoHSL([h, s, v]): [number, number, number] {
  var _h = h,
      _s = s * v,
      _l = (2 - s) * v;
  _s /= (_l <= 1) ? _l : 2 - _l;
  _l /= 2;

  return [
      _h,
      _s,
      _l
  ];
}

export function HSLtoHSV([h, s, l]): [number, number, number] {
  var _h = h,
      _s,
      _v;

  l *= 2;
  s *= (l <= 1) ? l : 2 - l;
  _v = (l + s) / 2;
  _s = (2 * s) / (l + s);

  return [
      _h,
      _s,
      _v
  ];
}