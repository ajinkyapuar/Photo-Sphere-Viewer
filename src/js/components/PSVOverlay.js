import { AbstractComponent } from './AbstractComponent';

/**
 * Overlay class
 * @extends module:components.AbstractComponent
 * @memberof module:components
 */
export class PSVOverlay extends AbstractComponent {

  /**
   * @param {PhotoSphereViewer} psv
   */
  constructor(psv) {
    super(psv, 'psv-overlay');

    /**
     * Image container
     * @member {HTMLElement}
     * @readonly
     * @private
     */
    this.image = document.createElement('div');
    this.image.className = 'psv-overlay-image';
    this.container.appendChild(this.image);

    /**
     * Text container
     * @member {HTMLElement}
     * @readonly
     * @private
     */
    this.text = document.createElement('div');
    this.text.className = 'psv-overlay-text';
    this.container.appendChild(this.text);

    /**
     * Subtext container
     * @member {HTMLElement}
     * @readonly
     * @private
     */
    this.subtext = document.createElement('div');
    this.subtext.className = 'psv-overlay-subtext';
    this.container.appendChild(this.subtext);

    this.container.addEventListener('click', () => this.hideOverlay());

    this.hide();
  }

  /**
   * @override
   */
  destroy() {
    delete this.image;
    delete this.text;
    delete this.subtext;

    super.destroy();
  }

  /**
   * @summary Checks if the overlay is visible
   * @returns {boolean}
   */
  isOverlayVisible() {
    return this.visible;
  }

  /**
   * @summary Displays an overlay on the viewer
   * @param {Object|string} config
   * @param {string} config.image
   * @param {string} config.text
   * @param {string} config.subtext
   *
   * @example
   * viewer.showOverlay({
   *   image: '<svg></svg>',
   *   text: '....',
   *   subtext: '....'
   * })
   */
  showOverlay(config) {
    if (typeof config === 'string') {
      config = { text: config }; // eslint-disable-line no-param-reassign
    }

    this.image.innerHTML = config.image || '';
    this.text.innerHTML = config.text || '';
    this.subtext.innerHTML = config.subtext || '';

    this.show();

    /**
     * @event show-overlay
     * @memberof module:components.PSVOverlay
     * @summary Trigered when the overlay is shown
     */
    this.psv.trigger('show-overlay');
  }

  /**
   * @summary Hides the notification
   * @fires module:components.PSVOverlay.hide-notification
   */
  hideOverlay() {
    if (this.isOverlayVisible()) {
      this.hide();

      /**
       * @event hide-overlay
       * @memberof module:components.PSVOverlay
       * @summary Trigered when the overlay is hidden
       */
      this.psv.trigger('hide-overlay');
    }
  }

}
