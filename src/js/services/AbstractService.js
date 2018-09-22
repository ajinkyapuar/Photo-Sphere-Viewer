/**
 * @module services
 */

/**
 * Base services class
 * @memberof module:services
 */
export class AbstractService {

  /**
   * @param {PhotoSphereViewer} psv
   */
  constructor(psv) {
    /**
     * @summary Reference to main controller
     * @type {PhotoSphereViewer}
     * @readonly
     */
    this.psv = psv;

    /**
     * @summary Configuration holder
     * @type {Object}
     * @readonly
     */
    this.config = psv.config;

    /**
     * @summary Properties holder
     * @type {Object}
     * @readonly
     */
    this.prop = psv.prop;
  }

  /**
   * @summary Destroys the service
   */
  destroy() {
    delete this.psv;
    delete this.config;
    delete this.prop;
  }

}
