import { PhotoSphereViewer } from '../PhotoSphereViewer';

/**
 * @module components
 */

/**
 * Base component class
 * @memberof module:components
 */
export class AbstractComponent {

  /**
   * @param {PhotoSphereViewer | module:components.AbstractComponent} parent
   * @param {string} className - CSS class added to the component's container
   */
  constructor(parent, className) {
    /**
     * @summary Reference to main controller
     * @type {PhotoSphereViewer}
     * @readonly
     */
    this.psv = parent instanceof PhotoSphereViewer ? parent : parent.psv;

    /**
     * @member {PhotoSphereViewer|module:components.AbstractComponent}
     * @readonly
     */
    this.parent = parent;

    /**
     * @summary Visibility of the component
     * @member {boolean}
     * @readonly
     */
    this.visible = true;

    /**
     * @member {HTMLElement}
     * @readonly
     */
    this.container = document.createElement('div');
    this.container.className = className;
    this.parent.container.appendChild(this.container);
  }

  /**
   * @summary Destroys the component
   */
  destroy() {
    this.parent.container.removeChild(this.container);

    delete this.container;
    delete this.parent;
    delete this.psv;
  }

  /**
   * @summary Hides the component
   * @package
   */
  hide() {
    this.container.style.display = 'none';
    this.visible = false;
  }

  /**
   * @summary Displays the component
   * @package
   */
  show() {
    this.container.style.display = '';
    this.visible = true;
  }

}
