import { MARKER_DATA, MARKER_TYPES, SVG_NS } from './data/constants';
import { EASINGS } from './data/easings';
import { PSVError } from './PSVError';
import { addClasses, dasherize, deepmerge, each, parseAngle, parsePosition } from './utils';

/**
 * Object representing a marker
 */
export class PSVMarker {

  /**
   * @member {PhotoSphereViewer}
   * @readonly
   * @protected
   */
  psv;

  config = {};

  __anchor;

  __position3D;

  __positions3D;

  /**
   * @member {boolean}
   */
  __visible = true;

  /**
   * @member {boolean}
   * @readonly
   * @private
   */
  __dynamicSize = false;

  /**
   * @summary Formatted definition of the marker
   * @member {*}
   * @private
   */
  __def;

  /**
   * @member {string}
   * @readonly
   */
  __id;

  /**
   * @member {string}
   * @see PSVMarker.types
   * @readonly
   */
  __type;

  /**
   * @member {HTMLDivElement|SVGElement}
   * @readonly
   */
  __el;

  /**
   * @param {Object} properties - see {@link http://photo-sphere-viewer.js.org/markers.html#config}
   * @param {PhotoSphereViewer} psv
   * @throws {PSVError} when the configuration is incorrect
   */
  constructor(properties, psv) {
    if (!properties.id) {
      throw new PSVError('missing marker id');
    }

    if (properties.image && (!properties.width || !properties.height)) {
      throw new PSVError('missing marker width/height');
    }

    if (properties.image || properties.html) {
      if ((!('x' in properties) || !('y' in properties)) && (!('latitude' in properties) || !('longitude' in properties))) {
        throw new PSVError('missing marker position, latitude/longitude or x/y');
      }
    }

    this.psv = psv;

    this.__id = properties.id;
    this.__type = PSVMarker.getType(properties, false);

    // create element
    if (this.isNormal()) {
      this.__el = document.createElement('div');
    }
    else if (this.isPolygon()) {
      this.__el = document.createElementNS(SVG_NS, 'polygon');
    }
    else if (this.isPolyline()) {
      this.__el = document.createElementNS(SVG_NS, 'polyline');
    }
    else {
      this.__el = document.createElementNS(SVG_NS, this.type);
    }

    this.$el.id = `psv-marker-${this.id}`;
    this.$el[MARKER_DATA] = this;

    this.update(properties);
  }

  get id() {
    return this.__id;
  }

  get type() {
    return this.__type;
  }

  get $el() {
    return this.__el;
  }

  get visible() {
    return this.__visible;
  }

  get dynamicSize() {
    return this.__dynamicSize;
  }

  get def() {
    return this.__def;
  }

  /**
   * @summary Destroys the marker
   */
  destroy() {
    delete this.$el[MARKER_DATA];
    delete this.$el;
    delete this.config;
    delete this.__position3D;
    delete this.__positions3D;
    delete this.__def;
    delete this.psv;
  }

  /**
   * @summary Checks if it is a normal marker (image or html)
   * @returns {boolean}
   */
  isNormal() {
    return this.type === MARKER_TYPES.image
      || this.type === MARKER_TYPES.html;
  }

  /**
   * @summary Checks if it is a polygon/polyline marker
   * @returns {boolean}
   */
  isPoly() {
    return this.isPolygon()
      || this.isPolyline();
  }

  /**
   * @summary Checks if it is a polygon/polyline using pixel coordinates
   * @returns {boolean}
   */
  isPolyPx() {
    return this.type === MARKER_TYPES.polygonPx
      || this.type === MARKER_TYPES.polylinePx;
  }

  /**
   * @summary Checks if it is a polygon/polyline using radian coordinates
   * @returns {boolean}
   */
  isPolyRad() {
    return this.type === MARKER_TYPES.polygonRad
      || this.type === MARKER_TYPES.polylineRad;
  }

  /**
   * @summary Checks if it is a polygon marker
   * @returns {boolean}
   */
  isPolygon() {
    return this.type === MARKER_TYPES.polygonPx
      || this.type === MARKER_TYPES.polygonRad;
  }

  /**
   * @summary Checks if it is a polyline marker
   * @returns {boolean}
   */
  isPolyline() {
    return this.type === MARKER_TYPES.polylinePx
      || this.type === MARKER_TYPES.polylineRad;
  }

  /**
   * @summary Checks if it is an SVG marker
   * @returns {boolean}
   */
  isSvg() {
    return this.type === MARKER_TYPES.square
      || this.type === MARKER_TYPES.rect
      || this.type === MARKER_TYPES.circle
      || this.type === MARKER_TYPES.ellipse
      || this.type === MARKER_TYPES.path;
  }

  /**
   * @summary Computes marker scale from zoom level
   * @param {float} zoomLevel
   * @returns {float}
   */
  getScale(zoomLevel) {
    if (Array.isArray(this.config.scale)) {
      return this.config.scale[0] + (this.config.scale[1] - this.config.scale[0]) * EASINGS.inQuad(zoomLevel / 100);
    }
    else if (typeof this.config.scale === 'function') {
      return this.config.scale(zoomLevel);
    }
    else if (typeof this.config.scale === 'number') {
      return this.config.scale * EASINGS.inQuad(zoomLevel / 100);
    }
    else {
      return 1;
    }
  }

  /**
   * @summary Updates the marker with new properties
   * @param {object} [properties]
   * @throws {PSVError} when trying to change the marker's type
   */
  update(properties) {
    if (properties && properties !== this.config) {
      const newType = PSVMarker.getType(properties, true);

      if (newType !== undefined && newType !== this.type) {
        throw new PSVError('cannot change marker type');
      }

      deepmerge(this.config, properties);
    }

    // reset CSS class
    if (this.isNormal()) {
      this.$el.setAttribute('class', 'psv-marker psv-marker--normal');
    }
    else {
      this.$el.setAttribute('class', 'psv-marker psv-marker--svg');
    }

    // add CSS classes
    if (this.config.className) {
      addClasses(this.$el, this.config.className);
    }
    if (this.config.tooltip) {
      addClasses(this.$el, 'has-tooltip');
      if (typeof this.config.tooltip === 'string') {
        this.config.tooltip = { content: this.config.tooltip };
      }
    }

    // apply style
    if (this.config.style) {
      deepmerge(this.$el.style, this.config.style);
    }

    // parse anchor
    this.__anchor = parsePosition(this.config.anchor);

    if (this.isNormal()) {
      this.__updateNormal();
    }
    else if (this.isPoly()) {
      this.__updatePoly();
    }
    else {
      this.__updateSvg();
    }
  }

  /**
   * @summary Updates a normal marker
   * @private
   */
  __updateNormal() {
    if (this.config.width && this.config.height) {
      this.$el.style.width = this.config.width + 'px';
      this.$el.style.height = this.config.height + 'px';
      this.__dynamicSize = false;
    }
    else {
      this.__dynamicSize = true;
    }

    if (this.config.image) {
      this.__def = this.config.image;
      this.$el.style.backgroundImage = `url(${this.config.image})`;
    }
    else if (this.config.html) {
      this.__def = this.config.html;
      this.$el.innerHTML = this.config.html;
    }

    // set anchor
    this.$el.style.transformOrigin = `${this.__anchor.left * 100}% ${this.__anchor.top * 100}%`;

    // convert texture coordinates to spherical coordinates
    this.psv.dataHelper.cleanPosition(this.config);

    // compute x/y/z position
    this.__position3D = this.psv.dataHelper.sphericalCoordsToVector3(this.config);
  }

  /**
   * @summary Updates an SVG marker
   * @private
   */
  __updateSvg() {
    this.__dynamicSize = true;

    // set content
    switch (this.type) {
      case MARKER_TYPES.square:
        this.__def = {
          x     : 0,
          y     : 0,
          width : this.config.square,
          height: this.config.square,
        };
        break;

      case MARKER_TYPES.rect:
        if (Array.isArray(this.config.rect)) {
          this.__def = {
            x     : 0,
            y     : 0,
            width : this.config.rect[0],
            height: this.config.rect[1],
          };
        }
        else {
          this.__def = {
            x     : 0,
            y     : 0,
            width : this.config.rect.width,
            height: this.config.rect.height,
          };
        }
        break;

      case MARKER_TYPES.circle:
        this.__def = {
          cx: this.config.circle,
          cy: this.config.circle,
          r : this.config.circle,
        };
        break;

      case MARKER_TYPES.ellipse:
        if (Array.isArray(this.config.ellipse)) {
          this.__def = {
            cx: this.config.ellipse[0],
            cy: this.config.ellipse[1],
            rx: this.config.ellipse[0],
            ry: this.config.ellipse[1],
          };
        }
        else {
          this.__def = {
            cx: this.config.ellipse.rx,
            cy: this.config.ellipse.ry,
            rx: this.config.ellipse.rx,
            ry: this.config.ellipse.ry,
          };
        }
        break;

      case MARKER_TYPES.path:
        this.__def = {
          d: this.config.path,
        };
        break;

      // no default
    }

    Object.getOwnPropertyNames(this.__def).forEach((prop) => {
      this.$el.setAttributeNS(SVG_NS, prop, this.__def[prop]);
    });

    // set style
    if (this.config.svgStyle) {
      Object.getOwnPropertyNames(this.config.svgStyle).forEach((prop) => {
        this.$el.setAttributeNS(SVG_NS, dasherize(prop), this.config.svgStyle[prop]);
      });
    }
    else {
      this.$el.setAttributeNS(SVG_NS, 'fill', 'rgba(0,0,0,0.5)');
    }

    // convert texture coordinates to spherical coordinates
    this.psv.dataHelper.cleanPosition(this.config);

    // compute x/y/z position
    this.__position3D = this.psv.dataHelper.sphericalCoordsToVector3(this);
  }

  /**
   * @summary Updates a polygon marker
   * @param {'polygon_rad'|'polyline_rad'} key_rad
   * @param {'polygon_px'|'polyline_px'} key_px
   * @private
   */
  __updatePoly() {
    this.__dynamicSize = true;

    // set style
    if (this.config.svgStyle) {
      Object.getOwnPropertyNames(this.config.svgStyle).forEach((prop) => {
        this.$el.setAttributeNS(SVG_NS, dasherize(prop), this.config.svgStyle[prop]);
      });

      if (this.isPolyline() && !this.config.svgStyle.fill) {
        this.$el.setAttributeNS(SVG_NS, 'fill', 'none');
      }
    }
    else if (this.isPolygon()) {
      this.$el.setAttributeNS(SVG_NS, 'fill', 'rgba(0,0,0,0.5)');
    }
    else if (this.isPolyline()) {
      this.$el.setAttributeNS(SVG_NS, 'fill', 'none');
      this.$el.setAttributeNS(SVG_NS, 'stroke', 'rgb(0,0,0)');
    }

    // fold arrays: [1,2,3,4] => [[1,2],[3,4]]
    const actualPoly = this.config.polygonPx || this.config.polygonRad || this.config.polylinePx || this.config.polylineRad;
    if (!Array.isArray(actualPoly[0])) {
      for (let i = 0; i < actualPoly.length; i++) {
        actualPoly.splice(i, 2, [actualPoly[i], actualPoly[i + 1]]);
      }
    }

    // convert texture coordinates to spherical coordinates
    if (this.isPolyPx()) {
      this.__def = actualPoly.map((coord) => {
        const sphericalCoords = this.psv.dataHelper.textureCoordsToSphericalCoords({ x: coord[0], y: coord[1] });
        return [sphericalCoords.longitude, sphericalCoords.latitude];
      });
    }
    // clean angles
    else {
      this.__def = actualPoly.map((coord) => {
        return [parseAngle(coord[0]), parseAngle(coord[1], true)];
      });
    }

    // TODO : compute the center of the polygon
    this.config.longitude = this.__def[0][0];
    this.config.latitude = this.__def[0][1];

    // compute x/y/z positions
    this.__positions3D = this.__def.map((coord) => {
      return this.psv.dataHelper.sphericalCoordsToVector3({ longitude: coord[0], latitude: coord[1] });
    });
  }

  /**
   * @summary Determines the type of a marker by the available properties
   * @param {object} properties
   * @param {boolean} [allowNone=false]
   * @returns {string}
   * @throws {PSVError} when the marker's type cannot be found
   */
  static getType(properties, allowNone = false) {
    const found = [];

    each(MARKER_TYPES, (type) => {
      if (type in properties) {
        found.push(type);
      }
    });

    if (found.length === 0 && !allowNone) {
      throw new PSVError(`missing marker content, either ${Object.keys(MARKER_TYPES).join(', ')}`);
    }
    else if (found.length > 1) {
      throw new PSVError(`multiple marker content, either ${Object.keys(MARKER_TYPES).join(', ')}`);
    }

    return found[0];
  }

}
