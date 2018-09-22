import { Texture } from 'three';
import { PSVMarker } from './PSVMarker';

type PSVAngle = number | string;

export type CssPosition = {
  top: number;
  left: number;
}

export type MouseWheelData = {
  spinX: number;
  spinY: number;
  pixelX: number;
  pixelY: number;
}

export type PSVPoint = {
  x: number;
  y: number;
}

export type PSVSize = {
  width: number;
  height: number;
}

export type CssSize = {
  width: string;
  height: string;
}

export type PSVPosition = {
  longitude: number;
  latitude: number;
}

export type PSVExtendedPosition = PSVPosition | PSVPoint;

export type PSVCacheItem = {
  panorama: string;
  image: Texture;
  panoData: PSVPanoData;
}

export type PSVClickData = {
  clientX: number;
  clientY: number;
  viewerX: number;
  viewerY: number;
  longitude: number;
  latitude: number;
  textureX: number;
  textureY: number;
  marker?: PSVMarker;
}

export type PSVNavbarCustomButton = {
  id: string;
  title?: string;
  content?: string;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

enum PSVActions {
  rotateLatitudeUp = 'rotateLatitudeUp',
  rotateLatitudeDown = 'rotateLatitudeDown',
  rotateLongitudeRight = 'rotateLongitudeRight',
  rotateLongitudeLeft = 'rotateLongitudeLeft',
  zoomIn = 'zoomIn',
  zoomOut = 'zoomOut',
  toggleAutorotate = 'toggleAutorotate',
}

type PSVKeyboardOptions = { [key: string]: PSVActions };

export type PSVSphereCorrection = {
  pan: number;
  tilt: number;
  roll: number;
}

export type PSVTooltipOptions = {
  offset: number;
  arrowSize: number;
  delay: number;
}

export type PSVLangOptions = {
  autorotate: string;
  zoom: string;
  zoomOut: string;
  zoomIn: string;
  download: string;
  fullscreen: string;
  markers: string;
  gyroscope: string;
  stereo: string;
  stereoNotification: string;
  pleaseRotate: [string, string];
  twoFingers: [string];
}

export type PSVTransitionOptions = {
  duration: number;
  loader: boolean;
}

export type PSVTemplateOptions = {
  markersList: string;
}

export type PSVPanoData = {
  fullWidth: number;
  fullHeight: number;
  croppedWidth: number;
  croppedHeight: number;
  croppedX: number;
  croppedY: number;
}

export type PSVNavbarOptions = string | Array<string | PSVNavbarCustomButton>;

export type PSVOptions = {
  animLatitude: PSVAngle;
  animSpeed: string | number;
  cacheTexture: number;
  caption: string;
  clickEventOnMarker: boolean;
  container: string;
  defaultFov: number;
  defaultLatitude: PSVAngle;
  defaultLongitude: PSVAngle;
  fisheye: boolean | number;
  keyboard: PSVKeyboardOptions;
  lang: PSVLangOptions;
  latitudeRange: [PSVAngle, PSVAngle];
  loadingImg: string;
  loadingTxt: string;
  longitudeRange: [PSVAngle, PSVAngle];
  markers: Array<Partial<PSVMarkerDefinition>>;
  maxFov: number;
  minFov: number;
  mousemove: boolean;
  mousemoveHover: boolean;
  mousewheel: boolean;
  mousewheelFactor: number;
  moveInertie: boolean;
  moveSpeed: number;
  navbar: PSVNavbarOptions;
  panoData: PSVPanoData;
  panorama: string;
  size: PSVSize;
  sphereCorrection: PSVSphereCorrection;
  templates: PSVTemplateOptions;
  timeAnim: boolean | number;
  tooltip: PSVTooltipOptions;
  touchmoveTwoFingers: boolean;
  transition: PSVTransitionOptions;
  useXmpData: boolean;
  webgl: boolean;
  withCredentials: boolean;
  zoomSpeed: number;
}

export type PSVTooltipDefinition = {
  content: string;
  position?: string;
}

export enum PSVMarkerType {
  image = 'image',
  html = 'html',
  polygonPx = 'polygonPx',
  polygonRad = 'polygonRad',
  polylinePx = 'polylinePx',
  polylineRad = 'polylineRad',
  square = 'square',
  rect = 'rect',
  circle = 'circle',
  ellipse = 'ellipse',
  path = 'path',
}

export type PSVMarkerScaleFn = (zoomLevel: number) => number;

export type PSVCoords =  Array<[number, number]>;

export type PSVMarkerDefinition = PSVPoint & PSVPosition & PSVSize & {
  id: string;
  image: string;
  html: string;
  square: number;
  rect: [number, number] | { width: number, height: number };
  circle: number;
  ellipse: [number, number] | { rx: number, ry: number };
  path: string;
  polygonPx: number[] | PSVCoords;
  polygonRad: number[] | PSVCoords;
  polylinePx: number[] | PSVCoords;
  polylineRad: number[] | PSVCoords;
  scale: number | [number, number] | PSVMarkerScaleFn;
  className: string;
  anchor: string | CssPosition;
  visible: boolean;
  tooltip: string | PSVTooltipDefinition;
  style: { [key: string]: string };
  svgStyle: { [key: string]: string };
  content: string;
  data: any;
}

