/*!
 * Hue Wheel Generator
 * @author Hui Huang <mailbox4hh@gmail.com>
 * @version 1.0.1
 * @license MIT
 */

/**
 * Round some number to int
 * 
 * @param {Number} num - The number to be rounded
 * @param {Number=} at  - If decimal is larger than "at" round up
 * 
 * @return {Number} rounded number
 */
function roundUp(num, at = 5) {
  const add_on = (10 - at) * 0.1;

  return (num + add_on) >= Math.ceil(num) ? Math.ceil(num) : Math.floor(num);
}

/**
 * convert hsl to rgb
 * {@link https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV}
 * 
 * @param {Number} hue - Hue [0 <-> 360]: degree
 * @param {Number} saturation - Saturation: [0 <-> 1]
 * @param {Number} lightness - Lightness: [0 <-> 1]
 * 
 * @return {(Number|Array)} [red, green, blue] r,g,b: [0 <-> 255]
 */
function hsl2rgb(hue, sat, lig) {
  const chroma = (1 - Math.abs(2 * lig - 1)) * sat;
  const intermediate_hue = hue / 60;
  const intermediate_value = chroma * (1 - Math.abs(intermediate_hue % 2 - 1));
  const add_on = lig - chroma * 0.5;

  let intermediate_rgb = [-1, -1, -1];
  let rgb = [-1, -1, -1];
  
  switch(Math.floor(intermediate_hue)) {
    case 0:
      intermediate_rgb = [chroma, intermediate_value, 0];
      break;
  
    case 1:
      intermediate_rgb = [intermediate_value, chroma, 0];
      break;
  
    case 2:
      intermediate_rgb = [0, chroma, intermediate_value];
      break;
  
    case 3:
      intermediate_rgb = [0, intermediate_value, chroma];
      break;

    case 4:
      intermediate_rgb = [intermediate_value, 0, chroma];
      break;
  
    case 5:
      intermediate_rgb = [chroma, 0, intermediate_value];
      break;

    case 6:
      intermediate_rgb = [chroma, 0, intermediate_value];
      break;
  
    default:
      intermediate_rgb = [0, 0, 0];
  }
  
  // red channel
  rgb[0] = Math.floor((intermediate_rgb[0] + add_on) * 255);
  // green channel
  rgb[1] = Math.floor((intermediate_rgb[1] + add_on) * 255);
  // blue channel
  rgb[2] = Math.floor((intermediate_rgb[2] + add_on) * 255);

  return rgb;
}

/**
 * convert rgb to hsl
 * {@link https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV}
 * 
 * @param {Number} R - red [0 <-> 255] int
 * @param {Number} G - green [0 <-> 255] int
 * @param {Number} B - blue [0 <-> 255] int
 * 
 * @return {(Number|Array)} [hue, saturation, lightness] h: [0 <-> 360], s: [0 <-> 1], l: [0 <-> 1]
 */
function rgb2hsl(R, G, B) {
  const r = R / 255;
  const g = G / 255;
  const b = B / 255;

  const MAX = Math.max(r, g, b);
  const MIN = Math.min(r, g, b);

  let hsl = [-1, -1, -1];

  let hue = -1;
  let saturation = -1;
  let lightness = -1;

  if (MAX === MIN) {
    hue = 0;
  } else if (MAX === r) {
    hue = 60 * (g - b) / (MAX - MIN);
  } else if (MAX === g) {
    hue = 60 * (2.0 + (b - r) / (MAX - MIN));
  } else {
    hue = 60 * (4.0 + (r - g) / (MAX - MIN));
  }

  if (hue < 0) {
    hue = hue + 360.0;
  }

  lightness = (MAX + MIN) * 0.5;

  saturation = (MAX === 0 || MIN === 1) ? 0 : ((MAX - lightness) / Math.min(lightness, 1 - lightness));

  // hue
  hsl[0] = roundUp(hue, 5);
  // saturation
  hsl[1] = roundUp(saturation * 100, 5) * 0.01;
  // lightness
  hsl[2] = roundUp(lightness * 100, 5) * 0.01;

  return hsl;
}

/**
 * @param {Number} redStart - Define where red(hue 0, saturation 100%, lightness 50%) starts (12 O'clock position is 90 degree and degree increases counterclockwise)
 * @param {Number} style - clockwise style 1 red -> green -> blue -> red | 0 red -> blue -> green -> red
 * @param {Number} theta - current angle in the hue wheel: [0 <-> 360] degree
 * 
 * @return {Number} hue: [0 <-> 360] degree
 */
function getHue(redStart, theta, style = 0) {
  let hue = -1;
  let temp = theta || 1;

  // clockwise style (1: R->G->B->R or 0: R->B->G->R) multiplier
  if (style !== 0) {
    // clockwise style 1: red -> green -> blue -> red
    temp = (360 + 2 * redStart - temp) % 360;
  }

  hue = (360 + temp - redStart) % 360;

  return hue;
}

/**
 * draw a hue wheel
 * @param {Object} - Object contains all the parameters needed
 * @param {String|HTMLElement} canvasID - ID of the canvas element which will display the hue wheel
 * @param {Number} inner_radius - inner void circle's radius
 * @param {Number} thickness - thickness of the ring/wheel
 * @param {Number=} redStart - Define where red(hue 0, saturation 100%, lightness 50%) starts (12 O'clock position is 90 degree and degree increases counterclockwise)
 * @param {Number=} style - clockwise style 1 red -> green -> blue -> red | 0 red -> blue -> green -> red, default 0
 * @param {Number=} saturation - [0 <-> 1], default 100%
 * @param {Number=} lightness - [0 <-> 1], default 50%
 * @param {Number=} opacity - Transparent [0 <-> 255] Opaque, default opaque
 */
function drawHueWheel({canvasID, inner_radius, thickness, redStart = 90, style = 0, saturation = 1, lightness = 0.5, opacity = 255,}) {
  /*
   * get the actual width and height for the screen 
   * make sure display clearly for all kinds of screens
   * 
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio}
   * window.devicePixelRatio will return the ratio of the resolution in physical pixels 
   * to the resolution in CSS pixels for the current display device
   */

  // scale is 1 for normal screen, 2 for HiDPI screen e.g. retina screen
  const scale = window.devicePixelRatio;
  
  let canvas = document.getElementById(canvasID);
  
  /*
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext}
   * 
   * returns a drawing context on the canvas, 
   * or null if the context identifier is not supported.
   * 
   * "2d", leading to the creation of a CanvasRenderingContext2D object 
   * representing a two-dimensional rendering context.
   */
  let ctx = canvas.getContext('2d');

  let outer_radius = inner_radius + thickness;

  // width and height measured in CSS pixel
  canvas.style.width = 2 * outer_radius + 'px';
  canvas.style.height = 2 * outer_radius + 'px';
  
  // adjust radii
  outer_radius *= scale;
  inner_radius *= scale;
  
  // the actual width and height of the canvas for the screen
  canvas.width = 2 * outer_radius;
  canvas.height = 2 * outer_radius;

  // normalize canvas coordinate system to use CSS pixels
  ctx.scale(scale, scale);

  let image = ctx.createImageData(2 * outer_radius, 2 * outer_radius);
  let pixels = image.data;

  /*
   * {@link https://medium.com/@bantic/hand-coding-a-color-wheel-with-canvas-78256c9d7d43}
   */
  // square of the outer radius
  const square_o = outer_radius * outer_radius;
  // square of the inner radius
  const square_i = inner_radius * inner_radius;

  // assume wheel center (0,0)
  for (let x = -outer_radius; x < outer_radius; x += 1) {
    for (let y = -outer_radius; y < outer_radius; y += 1) {
      // d: squared distance from (x,y) to the center
      let square_d = x * x + y * y;

      // skip all (x,y) outside the ring area
      if (square_d > square_o || square_d < square_i) {
        continue;
      }

      /*
       * find the corresponding pixels[index] for (x,y)
       * use r_len (length of each row) to calculate index in the 1D array
       */ 
      let r_len = 2 * outer_radius;
      let adjusted_x = x + outer_radius;
      let adjusted_y = y + outer_radius;
  
      // find the corresponding index
      let index = (adjusted_y * r_len + adjusted_x) * 4;
  
      /*
       * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2}
       * returns a numeric value between [-PI, PI] measured in radians
       * note: y-axis increases downwards
       */
      let theta = (360 + Math.atan2(-y, x) * 360 / (2 * Math.PI)) % 360;
  
      /*
       * find the corresponding color for pixel @ (x,y)
       * get hue using arctan(y/x)
       */
      let hue = getHue(redStart, theta, style);
  
      // hsl to rgb
      let rgb = hsl2rgb(hue, saturation, lightness);

      /*
       * one pixel needs 4 pixels[n]: 
       * pixels[index + 0] red [0 <-> 255]
       * pixels[index + 1] green [0 <-> 255]
       * pixels[index + 2] blue [0 <-> 255]
       * pixels[index + 3] opacity [transparen 0 <-> 255 opaque]
       */
      pixels[index + 0] = rgb[0];
      pixels[index + 1] = rgb[1];
      pixels[index + 2] = rgb[2];
      pixels[index + 3] = opacity;
    }
  }

  /*
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData}
   * void ctx.putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
   * dx Horizontal position to place the image data
   * dy Vertical position 
   */
  ctx.putImageData(image, 0, 0);
}
