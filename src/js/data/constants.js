/**
 * @summary Namespace for SVG creation
 * @type {string}
 * @readonly
 */
export const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * @summary Number of pixels bellow which a mouse move will be considered as a click
 * @type {int}
 * @readonly
 * @private
 */
export const MOVE_THRESHOLD = 4;

/**
 * @summary Angle in radians bellow which two angles are considered identical
 * @type {float}
 * @readonly
 * @private
 */
export const ANGLE_THRESHOLD = 0.003;

/**
 * @summary Delay in milliseconds between two clicks to consider a double click
 * @type {int}
 * @readonly
 * @private
 */
export const DBLCLICK_DELAY = 300;

/**
 * @summary Time size of the mouse position history used to compute inertia
 * @type {int}
 * @readonly
 * @private
 */
export const INERTIA_WINDOW = 300;

/**
 * @summary Radius of the THREE.SphereGeometry
 * Half-length of the THREE.BoxGeometry
 * @type {int}
 * @readonly
 * @private
 */
export const SPHERE_RADIUS = 100;

/**
 * @summary Number of vertice of the THREE.SphereGeometry
 * @type {int}
 * @readonly
 * @private
 */
export const SPHERE_VERTICES = 64;

/**
 * @summary Number of vertices of each side of the THREE.BoxGeometry
 * @type {int}
 * @readonly
 * @private
 */
export const CUBE_VERTICES = 8;

/**
 * @summary Order of cube textures for arrays
 * @type {int[]}
 * @readonly
 * @private
 */
export const CUBE_MAP = [0, 2, 4, 5, 3, 1];

/**
 * @summary Order of cube textures for maps
 * @type {string[]}
 * @readonly
 * @private
 */
export const CUBE_HASHMAP = ['left', 'right', 'top', 'bottom', 'back', 'front'];

/**
 * @summary Available actions
 * @type {object<string, string>}
 */
export const ACTIONS = {
  ROTATE_LAT_UP    : 'rotateLatitudeUp',
  ROTATE_LAT_DOWN  : 'rotateLatitudeDown',
  ROTATE_LONG_RIGHT: 'rotateLongitudeRight',
  ROTATE_LONG_LEFT : 'rotateLongitudeLeft',
  ZOOM_IN          : 'zoomIn',
  ZOOM_OUT         : 'zoomOut',
  TOGGLE_AUTOROTATE: 'toggleAutorotate',
};

/**
 * @summary Types of marker
 * @type {object<string, string>}
 */
export const MARKER_TYPES = {
  image      : 'image',
  html       : 'html',
  polygonPx  : 'polygonPx',
  polygonRad : 'polygonRad',
  polylinePx : 'polylinePx',
  polylineRad: 'polylineRad',
  square     : 'square',
  rect       : 'rect',
  circle     : 'circle',
  ellipse    : 'ellipse',
  path       : 'path',
};

/**
 * @summary Property name added to marker elements
 * @type {string}
 */
export const MARKER_DATA = 'psvMarker';
