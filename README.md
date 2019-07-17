# hue-wheel

## Descripton
A javascript library to generate simple and customizable hue wheel on canvas

|![hue wheel](gallery/hue-wheel-1.png?raw=true)|![hue wheel](gallery/hue-wheel-2.png?raw=true)|
|---|---|

## How to use
1) Load the js file in the file
```
<script scr=URL of the js file></script>
```

2) Create a hue wheel property object like below
```
let huewheel = {
  canvasID: 'canvas0',
  inner_radius: 100,
  thickness: 100,
  redStart: 0,
  style: 1,
};
```

|property|type|description|optional|
|--------|----|-----------|--------|
|canvasID|String|ID string of the canvas element which will display the hue wheel| N |
|inner_radius|Number|inner void circle's radius| N |
|thickness|Number|thickness of the ring/wheel| N |
|redStart|Number|Define where red(hue 0, saturation 100%, lightness 50%) start (12 O'clock position is 90 degree and degree increases counterclockwise), default 90| Y |
|style|Number|clockwise style 1: red -> green -> blue -> red, and clockwise style 0: red -> blue -> green -> red, default 0| Y |
|saturation|Number|[0 <-> 1], default 100%| Y |
|lightness|Number|[0 <-> 1], default 50%| Y |
|opacity|Number|Transparent [0 <-> 255] Opaque, default opaque| Y |

![explaination](hue-wheel-figure.png?raw=true)


3) And use the function below to draw a hue wheel on a canvas element
```
drawHueWheel(param_obj);
```
