import { AbstractComponent } from './AbstractComponent';

/**
 * Notification class
 * @extends module:components.AbstractComponent
 * @memberof module:components
 */
export class PSVNotification extends AbstractComponent {

  /**
   * @param {PhotoSphereViewer} psv
   */
  constructor(psv) {
    super(psv, 'psv-notification');

    /**
     * @member {Object}
     * @private
     */
    this.prop = {
      timeout: null,
    };

    /**
     * Notification content
     * @member {HTMLElement}
     * @readonly
     * @private
     */
    this.content = document.createElement('div');
    this.content.className = 'psv-notification-content';
    this.container.appendChild(this.content);

    this.content.addEventListener('click', () => this.hideNotification());
  }

  /**
   * @override
   */
  destroy() {
    delete this.content;

    super.destroy();
  }

  /**
   * @summary Checks if the notification is visible
   * @returns {boolean}
   */
  isNotificationVisible() {
    return this.container.classList.contains('psv-notification--visible');
  }

  /**
   * @summary Displays a notification on the viewer
   * @param {Object|string} config
   * @param {string} config.content
   * @param {int} [config.timeout]
   *
   * @example
   * viewer.showNotification({ content: 'Hello world', timeout: 5000})
   * viewer.showNotification('Hello world')
   */
  showNotification(config) {
    if (this.prop.timeout) {
      window.clearTimeout(this.prop.timeout);
      this.prop.timeout = null;
    }

    if (typeof config === 'string') {
      config = { content: config }; // eslint-disable-line no-param-reassign
    }

    this.content.innerHTML = config.content;

    this.container.classList.add('psv-notification--visible');

    /**
     * @event show-notification
     * @memberof module:components.PSVNotification
     * @summary Trigered when the notification is shown
     */
    this.psv.trigger('show-notification');

    if (config.timeout) {
      this.prop.timeout = window.setTimeout(() => this.hideNotification(), config.timeout);
    }
  }

  /**
   * @summary Hides the notification
   * @fires module:components.PSVNotification.hide-notification
   */
  hideNotification() {
    if (this.isNotificationVisible()) {
      this.container.classList.remove('psv-notification--visible');

      /**
       * @event hide-notification
       * @memberof module:components.PSVNotification
       * @summary Trigered when the notification is hidden
       */
      this.psv.trigger('hide-notification');
    }
  }

}
