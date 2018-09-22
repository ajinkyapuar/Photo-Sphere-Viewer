/**
 * @summary Collection of easing functions
 * {@link https://gist.github.com/frederickk/6165768}
 * @type {Object.<string, Function>}
 */
/* eslint-disable */
// @formatter:off
export const EASINGS = {
  linear    : (t) => t,

  inQuad    : (t) => t*t,
  outQuad   : (t) => t*(2-t),
  inOutQuad : (t) => t<.5 ? 2*t*t : -1+(4-2*t)*t,

  inCubic   : (t) => t*t*t,
  outCubic  : (t) => (--t)*t*t+1,
  inOutCubic: (t) => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,

  inQuart   : (t) => t*t*t*t,
  outQuart  : (t) => 1-(--t)*t*t*t,
  inOutQuart: (t) => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,

  inQuint   : (t) => t*t*t*t*t,
  outQuint  : (t) => 1+(--t)*t*t*t*t,
  inOutQuint: (t) => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t,

  inSine    : (t) => 1-Math.cos(t*(Math.PI/2)),
  outSine   : (t) => Math.sin(t*(Math.PI/2)),
  inOutSine : (t) => .5-.5*Math.cos(Math.PI*t),

  inExpo    : (t) => Math.pow(2, 10*(t-1)),
  outExpo   : (t) => 1-Math.pow(2, -10*t),
  inOutExpo : (t) => { t=t*2-1; return t<0 ? .5*Math.pow(2, 10*t) : 1-.5*Math.pow(2, -10*t); },

  inCirc    : (t) => 1-Math.sqrt(1-t*t),
  outCirc   : (t) => Math.sqrt(1-(t-1)*(t-1)),
  inOutCirc : (t) => { t*=2; return t<1 ? .5-.5*Math.sqrt(1-t*t) : .5+.5*Math.sqrt(1-(t-=2)*t); }
};
// @formatter:on
/* eslint-enable */
