import * as THREE from 'three';
import { MARKER_DATA, SPHERE_RADIUS, SVG_NS } from '../data/constants';
import { PSVError } from '../PSVError';
import { PSVMarker } from '../PSVMarker';
import { each, getClosest, hasParent, toggleClass } from '../utils';
import { AbstractComponent } from './AbstractComponent';

/**
 * HUD class
 * @extends module:components.AbstractComponent
 * @memberof module:components
 */
export class PSVHUD extends AbstractComponent {

  /**
   * @param {PhotoSphereViewer} psv
   */
  constructor(psv) {
    super(psv, 'psv-hud');

    /**
     * @summary All registered markers
     * @member {Object.<string, PSVMarker>}
     */
    this.markers = {};

    /**
     * @summary Last selected marker
     * @member {PSVMarker}
     * @readonly
     */
    this.currentMarker = null;

    /**
     * @summary Marker under the cursor
     * @member {PSVMarker}
     * @readonly
     */
    this.hoveringMarker = null;

    /**
     * @member {Object}
     * @private
     */
    this.prop = {
      panelOpened  : false,
      panelOpening : false,
      markersButton: this.psv.navbar.getNavbarButton('markers', true), // FIXME remove
    };

    /**
     * @member {SVGElement}
     * @readonly
     */
    this.svgContainer = document.createElementNS(SVG_NS, 'svg');
    this.svgContainer.setAttribute('class', 'psv-hud-svg-container');
    this.container.appendChild(this.svgContainer);

    // Markers events via delegation
    this.container.addEventListener('mouseenter', this, true);
    this.container.addEventListener('mouseleave', this, true);
    this.container.addEventListener('mousemove', this, true);

    // Viewer events
    this.psv.on('click', this);
    this.psv.on('dblclick', this);
    this.psv.on('render', this);
    this.psv.on('open-panel', this);
    this.psv.on('close-panel', this);
  }

  /**
   * @override
   */
  destroy() {
    this.clearMarkers(false);

    this.container.removeEventListener('mouseenter', this);
    this.container.removeEventListener('mouseleave', this);
    this.container.removeEventListener('mousemove', this);

    this.psv.off('click', this);
    this.psv.off('dblclick', this);
    this.psv.off('render', this);
    this.psv.off('open-panel', this);
    this.psv.off('close-panel', this);

    delete this.svgContainer;
    delete this.currentMarker;
    delete this.hoveringMarker;
    delete this.markers;
    delete this.prop;

    super.destroy();
  }

  /**
   * @summary Handles events
   * @param {Event} e
   * @private
   */
  handleEvent(e) {
    /* eslint-disable */
    switch (e.type) {
      // @formatter:off
      case 'mouseenter':  this.__onMouseEnter(e); break;
      case 'mouseleave':  this.__onMouseLeave(e); break;
      case 'mousemove':   this.__onMouseMove(e);  break;
      case 'click':       this.__onClick(e.args[0], e, false); break;
      case 'dblclick':    this.__onClick(e.args[0], e, true);  break;
      case 'render':      this.renderMarkers();   break;
      case 'open-panel':  this.__onPanelOpened(); break;
      case 'close-panel': this.__onPanelClosed(); break;
      // @formatter:on
    }
    /* eslint-enable */
  }

  /**
   * @summary Adds a new marker to viewer
   * @param {Object} properties - see {@link http://photo-sphere-viewer.js.org/markers.html#config}
   * @param {boolean} [render=true] - renders the marker immediately
   * @returns {PSVMarker}
   * @throws {PSVError} when the marker's id is missing or already exists
   */
  addMarker(properties, render = true) {
    if (!properties.id) {
      throw new PSVError('missing marker id');
    }

    if (this.markers[properties.id]) {
      throw new PSVError(`marker "${properties.id}" already exists`);
    }

    const marker = new PSVMarker(properties, this.psv);

    if (marker.isNormal()) {
      this.container.appendChild(marker.$el);
    }
    else {
      this.svgContainer.appendChild(marker.$el);
    }

    this.markers[marker.id] = marker;

    if (render) {
      this.renderMarkers();
    }

    return marker;
  }

  /**
   * @summary Returns the internal marker object for a marker id
   * @param {*} markerId
   * @returns {PSVMarker}
   * @throws {PSVError} when the marker cannot be found
   */
  getMarker(markerId) {
    const id = typeof markerId === 'object' ? markerId.id : markerId;

    if (!this.markers[id]) {
      throw new PSVError(`cannot find marker "${id}"`);
    }

    return this.markers[id];
  }

  /**
   * @summary Returns the last marker selected by the user
   * @returns {PSVMarker}
   */
  getCurrentMarker() {
    return this.currentMarker;
  }

  /**
   * @summary Updates the existing marker with the same id
   * @description Every property can be changed but you can't change its type (Eg: `image` to `html`).
   * @param {Object|PSVMarker} properties
   * @param {boolean} [render=true] - renders the marker immediately
   * @returns {PSVMarker}
   */
  updateMarker(properties, render = true) {
    const marker = this.getMarker(properties);

    marker.update(properties);

    if (render) {
      this.renderMarkers();
    }

    return marker;
  }

  /**
   * @summary Removes a marker from the viewer
   * @param {*} marker
   * @param {boolean} [render=true] - renders the marker immediately
   */
  removeMarker(marker, render = true) {
    marker = this.getMarker(marker); // eslint-disable-line no-param-reassign

    if (marker.isNormal()) {
      this.container.removeChild(marker.$el);
    }
    else {
      this.svgContainer.removeChild(marker.$el);
    }

    if (this.hoveringMarker === marker) {
      this.psv.tooltip.hideTooltip();
    }

    marker.destroy();
    delete this.markers[marker.id];

    if (render) {
      this.renderMarkers(); // FIXME useless ?
    }
  }

  /**
   * @summary Replaces all markers
   * @param {array} markers
   * @param {boolean} [render=true] - renders the marker immediately
   */
  setMarkers(markers, render = true) {
    this.clearMarkers(false);

    each(markers, marker => this.addMarker(marker, false));

    if (render) {
      this.renderMarkers();
    }
  }

  /**
   * @summary Removes all markers
   * @param {boolean} [render=true] - renders the markers immediately
   */
  clearMarkers(render = true) {
    each(this.markers, marker => this.removeMarker(marker, false));

    if (render) {
      this.renderMarkers();
    }
  }

  /**
   * @summary Rotate the view to face the marker
   * @param {*} marker
   * @param {string|int} [duration] - rotates smoothy, see {@link PhotoSphereViewer#animate}
   * @fires module:components.PSVHUD.goto-marker-done
   * @return {PSVAnimation}  A promise that will be resolved when the animation finishes
   */
  gotoMarker(marker, duration) {
    marker = this.getMarker(marker); // eslint-disable-line no-param-reassign

    return this.psv.animate(marker, duration)
      .then(() => {
        /**
         * @event goto-marker-done
         * @memberof module:components.PSVHUD
         * @summary Triggered when the animation to a marker is done
         * @param {PSVMarker} marker
         */
        this.psv.trigger('goto-marker-done', marker);
      });
  }

  /**
   * @summary Hides a marker
   * @param {*} marker
   */
  hideMarker(marker) {
    this.getMarker(marker).visible = false;
    this.renderMarkers();
  }

  /**
   * @summary Shows a marker
   * @param {*} marker
   */
  showMarker(marker) {
    this.getMarker(marker).visible = true;
    this.renderMarkers();
  }

  /**
   * @summary Toggles a marker
   * @param {*} marker
   */
  toggleMarker(marker) {
    this.getMarker(marker).visible ^= true;
    this.renderMarkers();
  }

  /**
   * @summary Toggles the visibility of markers list
   * FIXME : another class
   */
  toggleMarkersList() {
    if (this.prop.panelOpened) {
      this.hideMarkersList();
    }
    else {
      this.showMarkersList();
    }
  }

  /**
   * @summary Opens side panel with list of markers
   * @fires module:components.PSVHUD.filter:render-markers-list
   */
  showMarkersList() {
    const markers = [];
    each(this.markers, marker => markers.push(marker));

    /**
     * @event filter:render-markers-list
     * @memberof module:components.PSVHUD
     * @summary Used to alter the list of markers displayed on the side-panel
     * @param {PSVMarker[]} markers
     * @returns {PSVMarker[]}
     */
    const html = this.psv.templates.markersList({
      markers: this.psv.change('render-markers-list', markers),
      config : this.psv.config,
    });

    this.prop.panelOpening = true;
    this.psv.panel.showPanel(html, true);

    this.psv.panel.container.querySelector('.psv-markers-list').addEventListener('click', e => this.__onClickItem(e));
  }

  /**
   * @summary Closes side panel if it contains the list of markers
   */
  hideMarkersList() {
    if (this.prop.panelOpened) {
      this.psv.panel.hidePanel();
    }
  }

  /**
   * @summary Updates the visibility and the position of all markers
   */
  renderMarkers() {
    if (!this.visible) {
      return;
    }

    const rotation = !this.psv.isGyroscopeEnabled() ? 0 : THREE.Math.radToDeg(this.psv.viewer.camera.rotation.z);

    each(this.markers, (marker) => {
      let isVisible = marker.visible;

      if (isVisible && marker.isPoly()) {
        const positions = this.__getPolyPositions(marker);
        isVisible = positions.length > (marker.isPolygon() ? 2 : 1);

        if (isVisible) {
          marker.__position2D = this.__getPolyDimensions(marker, positions); // FIXME marker property

          const points = positions.map(pos => pos.x + ',' + pos.y).join(' ');

          marker.$el.setAttributeNS(SVG_NS, 'points', points);
        }
      }
      else if (isVisible) {
        const position = this.__getMarkerPosition(marker);
        isVisible = this.__isMarkerVisible(marker, position);

        if (isVisible) {
          marker.__position2D = position;

          const scale = marker.getScale(this.psv.getZoomLevel());

          if (marker.isSvg()) {
            let transform = `translate(${position.x}, ${position.y})`;
            if (scale !== 1) {
              transform += ` scale(${scale}, ${scale})`;
            }
            if (!marker.config.lockRotation && rotation) {
              transform += ` rotate(${rotation})`;
            }

            marker.$el.setAttributeNS(SVG_NS, 'transform', transform);
          }
          else {
            let transform = `translate3D(${position.x}px, ${position.y}px, 0px)`;
            if (scale !== 1) {
              transform += ` scale(${scale}, ${scale})`;
            }
            if (!marker.config.lockRotation && rotation) {
              transform += ` rotateZ(${rotation}deg)`;
            }

            marker.$el.style.transform = transform;
          }
        }
      }

      toggleClass(marker.$el, 'psv-marker--visible', isVisible);
    });
  }

  /**
   * @summary Determines if a point marker is visible<br>
   * It tests if the point is in the general direction of the camera, then check if it's in the viewport
   * @param {PSVMarker} marker
   * @param {PhotoSphereViewer.Point} position
   * @returns {boolean}
   * @private
   */
  __isMarkerVisible(marker, position) {
    return marker.__position3D.dot(this.psv.prop.direction) > 0
      && position.x + marker.width >= 0
      && position.x - marker.width <= this.psv.prop.size.width
      && position.y + marker.height >= 0
      && position.y - marker.height <= this.psv.prop.size.height;
  }

  /**
   * @summary Computes HUD coordinates of a marker
   * @param {PSVMarker} marker
   * @returns {PhotoSphereViewer.Point}
   * @private
   */
  __getMarkerPosition(marker) {
    if (marker.__dynamicSize) {
      // make the marker visible to get it's size
      toggleClass(marker.$el, 'psv-marker--transparent', true);
      const transform = marker.$el.style.transform;
      marker.$el.style.transform = null;

      const rect = marker.$el.getBoundingClientRect();

      marker.$el.style.transform = transform;
      toggleClass(marker.$el, 'psv-marker--transparent', false);

      marker.width = rect.right - rect.left;
      marker.height = rect.bottom - rect.top;
    }
    // FIXME size from config

    const position = this.psv.dataHelper.vector3ToViewerCoords(marker.__position3D);

    position.x -= marker.width * marker.anchor.left;
    position.y -= marker.height * marker.anchor.top;

    return position;
  }

  /**
   * @summary Computes HUD coordinates of each point of a polygon/polyline<br>
   * It handles points behind the camera by creating intermediary points suitable for the projector
   * @param {PSVMarker} marker
   * @returns {PhotoSphereViewer.Point[]}
   * @private
   */
  __getPolyPositions(marker) {
    const nbVectors = marker.__positions3D.length;

    // compute if each vector is visible
    const positions3D = marker.__positions3D.map((vector) => {
      return {
        vector : vector,
        visible: vector.dot(this.psv.prop.direction) > 0,
      };
    });

    // get pairs of visible/invisible vectors for each invisible vector connected to a visible vector
    const toBeComputed = [];
    positions3D.forEach((pos, i) => {
      if (!pos.visible) {
        const neighbours = [
          i === 0 ? positions3D[nbVectors - 1] : positions3D[i - 1],
          i === nbVectors - 1 ? positions3D[0] : positions3D[i + 1],
        ];

        neighbours.forEach((neighbour) => {
          if (neighbour.visible) {
            toBeComputed.push({
              visible  : neighbour,
              invisible: pos,
              index    : i,
            });
          }
        });
      }
    });

    // compute intermediary vector for each pair (the loop is reversed for splice to insert at the right place)
    toBeComputed.reverse().forEach((pair) => {
      positions3D.splice(pair.index, 0, {
        vector : this.__getPolyIntermediaryPoint(pair.visible.vector, pair.invisible.vector),
        visible: true,
      });
    });

    // translate vectors to screen pos
    return positions3D
      .filter(pos => pos.visible)
      .map(pos => this.psv.dataHelper.vector3ToViewerCoords(pos.vector));
  }

  /**
   * Given one point in the same direction of the camera and one point behind the camera,
   * computes an intermediary point on the great circle delimiting the half sphere visible by the camera.
   * The point is shifted by .01 rad because the projector cannot handle points exactly on this circle.
   * FIXME : does not work with fisheye view (must not use the great circle)
   * {@link http://math.stackexchange.com/a/1730410/327208}
   * @param P1 {THREE.Vector3}
   * @param P2 {THREE.Vector3}
   * @returns {THREE.Vector3}
   * @private
   */
  __getPolyIntermediaryPoint(P1, P2) {
    const C = this.psv.prop.direction.clone().normalize();
    const N = new THREE.Vector3().crossVectors(P1, P2).normalize();
    const V = new THREE.Vector3().crossVectors(N, P1).normalize();
    const H = new THREE.Vector3().addVectors(P1.clone().multiplyScalar(-C.dot(V)), V.clone().multiplyScalar(C.dot(P1))).normalize();
    const a = new THREE.Vector3().crossVectors(H, C);
    return H.applyAxisAngle(a, 0.01).multiplyScalar(SPHERE_RADIUS);
  }

  /**
   * @summary Computes the boundaries positions of a polygon/polyline marker
   * @param {PSVMarker} marker - alters width and height
   * @param {PhotoSphereViewer.Point[]} positions
   * @returns {PhotoSphereViewer.Point}
   * @private
   */
  __getPolyDimensions(marker, positions) {
    let minX = +Infinity;
    let minY = +Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    positions.forEach((pos) => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x);
      maxY = Math.max(maxY, pos.y);
    });

    marker.width = maxX - minX;
    marker.height = maxY - minY;

    return {
      x: minX,
      y: minY,
    };
  }

  __getTargetMarker(target, closest = false) {
    if (closest) {
      return target ? getClosest(target, '.psv-marker')[MARKER_DATA] : undefined;
    }
    else {
      return target ? target[MARKER_DATA] : undefined;
    }
  }

  __targetOnTooltip(target) {
    return target ? hasParent(target, this.psv.tooltip.container) : false;
  }

  /**
   * @summary Handles mouse enter events, show the tooltip for non polygon markers
   * @param {MouseEvent} e
   * @fires module:components.PSVHUD.over-marker
   * @private
   */
  __onMouseEnter(e) {
    const marker = this.__getTargetMarker(e.target);

    if (marker && !marker.isPoly()) {
      this.hoveringMarker = marker;

      /**
       * @event over-marker
       * @memberof module:components.PSVHUD
       * @summary Triggered when the user puts the cursor hover a marker
       * @param {PSVMarker} marker
       */
      this.psv.trigger('over-marker', marker);

      if (marker.tooltip) {
        this.psv.tooltip.showTooltip({
          content : marker.tooltip.content,
          position: marker.tooltip.position,
          left    : marker.__position2D.x,
          top     : marker.__position2D.y,
          box     : {
            width : marker.width,
            height: marker.height,
          },
        });
      }
    }
  }

  /**
   * @summary Handles mouse leave events, hide the tooltip
   * @param {MouseEvent} e
   * @fires module:components.PSVHUD.leave-marker
   * @private
   */
  __onMouseLeave(e) {
    const marker = this.__getTargetMarker(e.target);

    // do not hide if we enter the tooltip itself while hovering a polygon
    if (marker && !(marker.isPoly() && this.__targetOnTooltip(e.relatedTarget))) {
      /**
       * @event leave-marker
       * @memberof module:components.PSVHUD
       * @summary Triggered when the user puts the cursor away from a marker
       * @param {PSVMarker} marker
       */
      this.psv.trigger('leave-marker', marker);

      this.hoveringMarker = null;

      this.psv.tooltip.hideTooltip();
    }
  }

  /**
   * @summary Handles mouse move events, refresh the tooltip for polygon markers
   * @param {MouseEvent} e
   * @fires module:components.PSVHUD.leave-marker
   * @fires module:components.PSVHUD.over-marker
   * @private
   */
  __onMouseMove(e) {
    if (!this.psv.eventsHandler.state.moving) {
      let marker;
      const targetMarker = this.__getTargetMarker(e.target);

      if (targetMarker && targetMarker.isPoly()) {
        marker = targetMarker;
      }
      // do not hide if we enter the tooltip itself while hovering a polygon
      else if (this.__targetOnTooltip(e.target) && this.hoveringMarker) {
        marker = this.hoveringMarker;
      }

      if (marker) {
        if (!this.hoveringMarker) {
          this.psv.trigger('over-marker', marker);

          this.hoveringMarker = marker;
        }

        const boundingRect = this.psv.container.getBoundingClientRect();

        if (marker.tooltip) {
          this.psv.tooltip.showTooltip({
            content : marker.tooltip.content,
            position: marker.tooltip.position,
            top     : e.clientY - boundingRect.top - this.psv.config.tooltip.arrowSize / 2,
            left    : e.clientX - boundingRect.left - this.psv.config.tooltip.arrowSize,
            box     : { // separate the tooltip from the cursor
              width : this.psv.config.tooltip.arrowSize * 2,
              height: this.psv.config.tooltip.arrowSize * 2,
            },
          });
        }
      }
      else if (this.hoveringMarker && this.hoveringMarker.isPoly()) {
        this.psv.trigger('leave-marker', this.hoveringMarker);

        this.hoveringMarker = null;

        this.psv.tooltip.hideTooltip();
      }
    }
  }

  /**
   * @summary Handles mouse click events, select the marker and open the panel if necessary
   * @param {Object} data
   * @param {Event} e
   * @param {boolean} dblclick
   * @fires module:components.PSVHUD.select-marker
   * @fires module:components.PSVHUD.unselect-marker
   * @private
   */
  __onClick(data, e, dblclick) {
    const marker = this.__getTargetMarker(data.target, true);

    if (marker) {
      this.currentMarker = marker;

      /**
       * @event select-marker
       * @memberof module:components.PSVHUD
       * @summary Triggered when the user clicks on a marker. The marker can be retrieved from outside the event handler
       * with {@link module:components.PSVHUD.getCurrentMarker}
       * @param {PSVMarker} marker
       * @param {boolean} dblclick - the simple click is always fired before the double click
       */
      this.psv.trigger('select-marker', marker, dblclick);

      if (this.psv.config.clickEventOnMarker) {
        // add the marker to event data
        data.marker = marker;
      }
      else {
        e.stopPropagation();
      }
    }
    else if (this.currentMarker) {
      /**
       * @event unselect-marker
       * @memberof module:components.PSVHUD
       * @summary Triggered when a marker was selected and the user clicks elsewhere
       * @param {PSVMarker} marker
       */
      this.psv.trigger('unselect-marker', this.currentMarker);

      this.currentMarker = null;
    }

    if (marker && marker.content) {
      this.psv.panel.showPanel(marker.content);
    }
    else if (this.psv.panel.prop.opened) {
      e.stopPropagation();
      this.psv.panel.hidePanel();
    }
  }

  /**
   * @summary Clicks on an item
   * @param {MouseEvent} e
   * @fires module:components.PSVHUD.select-marker-list
   * @private
   */
  __onClickItem(e) {
    const li = e.target ? getClosest(e.target, 'li') : undefined;
    const markerId = li ? li.dataset[MARKER_DATA] : undefined;

    if (markerId) {
      const marker = this.getMarker(markerId);

      /**
       * @event select-marker-list
       * @memberof module:components.PSVHUD
       * @summary Triggered when a marker is selected from the side panel
       * @param {PSVMarker} marker
       */
      this.psv.trigger('select-marker-list', marker);

      this.gotoMarker(marker, 1000);
      this.psv.panel.hidePanel();
    }
  }

  /**
   * @summary Updates status when the panel is updated
   * @private
   */
  __onPanelOpened() {
    if (this.prop.panelOpening) {
      this.prop.panelOpening = false;
      this.prop.panelOpened = true;
    }
    else {
      this.prop.panelOpened = false;
    }

    if (this.prop.markersButton) {
      this.prop.markersButton.toggleActive(this.prop.panelOpened);
    }
  }

  /**
   * @summary Updates status when the panel is updated
   * @private
   */
  __onPanelClosed() {
    this.prop.panelOpened = false;
    this.prop.panelOpening = false;

    if (this.prop.markersButton) {
      this.prop.markersButton.toggleActive(false);
    }
  }

}
