import { PSVError } from '../PSVError';
import { addClasses, parsePosition } from '../utils';
import { AbstractComponent } from './AbstractComponent';

const LEFT_MAP = { 0: 'left', 0.5: 'center', 1: 'right' };
const TOP_MAP = { 0: 'top', 0.5: 'center', 1: 'bottom' };

/**
 * Tooltip class
 * @extends module:components.AbstractComponent
 * @memberof module:components
 */
export class PSVTooltip extends AbstractComponent {

  /**
   * @param {module:components.PSVHUD} hud
   */
  constructor(hud) {
    super(hud, 'psv-tooltip');

    /**
     * @member {Object}
     * @readonly
     * @private
     */
    this.config = this.psv.config.tooltip;

    /**
     * @member {Object}
     * @private
     */
    this.prop = {
      timeout: null,
    };

    /**
     * Tooltip content
     * @member {HTMLElement}
     * @readonly
     * @private
     */
    this.content = document.createElement('div');
    this.content.className = 'psv-tooltip-content';
    this.container.appendChild(this.content);

    /**
     * Tooltip arrow
     * @member {HTMLElement}
     * @readonly
     * @private
     */
    this.arrow = document.createElement('div');
    this.arrow.className = 'psv-tooltip-arrow';
    this.container.appendChild(this.arrow);

    this.container.style.top = '-1000px';
    this.container.style.left = '-1000px';

    this.psv.on('render', this);
  }

  /**
   * @override
   */
  destroy() {
    this.psv.off('render', this);

    delete this.arrow;
    delete this.content;
    delete this.config;
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
      case 'render': this.hideTooltip(); break;
      // @formatter:on
    }
    /* eslint-enable */
  }

  /**
   * @summary Checks if the tooltip is visible
   * @returns {boolean}
   */
  isTooltipVisible() {
    return this.container.classList.contains('psv-tooltip--visible');
  }

  /**
   * @summary Displays a tooltip on the viewer
   * @param {Object} config
   * @param {string} config.content - HTML content of the tootlip
   * @param {int} config.top - Position of the tip of the arrow of the tooltip, in pixels
   * @param {int} config.left - Position of the tip of the arrow of the tooltip, in pixels
   * @param {string|string[]} [config.position='top center'] - Tooltip position toward it's arrow tip.
   *                                                  Accepted values are combinations of `top`, `center`, `bottom`
   *                                                  and `left`, `center`, `right`
   * @param {string} [config.className] - Additional CSS class added to the tooltip
   * @param {Object} [config.box] - Used when displaying a tooltip on a marker
   * @param {int} [config.box.width=0]
   * @param {int} [config.box.height=0]
   * @fires module:components.PSVTooltip.show-tooltip
   * @throws {PSVError} when the configuration is incorrect
   *
   * @example
   * viewer.showTooltip({ content: 'Hello world', top: 200, left: 450, position: 'center bottom'})
   */
  showTooltip(config) {
    if (this.prop.timeout) {
      window.clearTimeout(this.prop.timeout);
      this.prop.timeout = null;
    }

    const isUpdate = this.isTooltipVisible();
    const t = this.container;
    const c = this.content;
    const a = this.arrow;

    if (!config.position) {
      config.position = ['top', 'center'];
    }

    if (!config.box) {
      config.box = {
        width : 0,
        height: 0,
      };
    }

    // parse position
    if (typeof config.position === 'string') {
      const tempPos = parsePosition(config.position);

      if (!(tempPos.left in LEFT_MAP) || !(tempPos.top in TOP_MAP)) {
        throw new PSVError(`unable to parse tooltip position "${config.position}"`);
      }

      config.position = [TOP_MAP[tempPos.top], LEFT_MAP[tempPos.left]];
    }

    if (config.position[0] === 'center' && config.position[1] === 'center') {
      throw new PSVError('unable to parse tooltip position "center center"');
    }

    if (isUpdate) {
      // Remove every other classes (Firefox does not implements forEach)
      for (let i = t.classList.length - 1; i >= 0; i--) {
        const item = t.classList.item(i);
        if (item !== 'psv-tooltip' && item !== 'psv-tooltip--visible') {
          t.classList.remove(item);
        }
      }
    }
    else {
      t.className = 'psv-tooltip'; // reset the class
    }

    if (config.className) {
      addClasses(t, config.className);
    }

    c.innerHTML = config.content;
    t.style.top = '0px';
    t.style.left = '0px';

    // compute size
    const rect = t.getBoundingClientRect();
    const style = {
      posClass : config.position.slice(),
      width    : rect.right - rect.left,
      height   : rect.bottom - rect.top,
      top      : 0,
      left     : 0,
      arrowTop : 0,
      arrowLeft: 0,
    };

    // set initial position
    this.__computeTooltipPosition(style, config);

    // correct position if overflow
    let refresh = false;
    if (style.top < this.config.offset) {
      style.posClass[0] = 'bottom';
      refresh = true;
    }
    else if (style.top + style.height > this.psv.prop.size.height - this.config.offset) {
      style.posClass[0] = 'top';
      refresh = true;
    }
    if (style.left < this.config.offset) {
      style.posClass[1] = 'right';
      refresh = true;
    }
    else if (style.left + style.width > this.psv.prop.size.width - this.config.offset) {
      style.posClass[1] = 'left';
      refresh = true;
    }
    if (refresh) {
      this.__computeTooltipPosition(style, config);
    }

    // apply position
    t.style.top = style.top + 'px';
    t.style.left = style.left + 'px';

    a.style.top = style.arrowTop + 'px';
    a.style.left = style.arrowLeft + 'px';

    t.classList.add('psv-tooltip--' + style.posClass.join('-'));

    // delay for correct transition between the two classes
    // TODO animation watcher
    if (!isUpdate) {
      this.prop.timeout = window.setTimeout(() => {
        t.classList.add('psv-tooltip--visible');
        this.prop.timeout = null;

        /**
         * @event show-tooltip
         * @memberof module:components.PSVTooltip
         * @summary Trigered when the tooltip is shown
         */
        this.psv.trigger('show-tooltip');
      }, this.config.delay);
    }
  }

  /**
   * @summary Hides the tooltip
   * @fires module:components.PSVTooltip.hide-tooltip
   */
  hideTooltip() {
    if (this.prop.timeout) {
      window.clearTimeout(this.prop.timeout);
      this.prop.timeout = null;
    }

    if (this.isTooltipVisible()) {
      this.container.classList.remove('psv-tooltip--visible');

      this.prop.timeout = window.setTimeout(() => {
        this.content.innerHTML = null;
        this.container.style.top = '-1000px';
        this.container.style.left = '-1000px';
        this.prop.timeout = null;
      }, this.config.delay);

      /**
       * @event hide-tooltip
       * @memberof module:components.PSVTooltip
       * @summary Trigered when the tooltip is hidden
       */
      this.psv.trigger('hide-tooltip');
    }
  }

  /**
   * @summary Computes the position of the tooltip and its arrow
   * @param {Object} style
   * @param {Object} config
   * @private
   */
  __computeTooltipPosition(style, config) {
    let topBottom = false;

    switch (style.posClass[0]) {
      case 'bottom':
        style.top = config.top + config.box.height + this.config.offset + this.config.arrowSize;
        style.arrowTop = -this.config.arrowSize * 2;
        topBottom = true;
        break;

      case 'center':
        style.top = config.top + config.box.height / 2 - style.height / 2;
        style.arrowTop = style.height / 2 - this.config.arrowSize;
        break;

      case 'top':
        style.top = config.top - style.height - this.config.offset - this.config.arrowSize;
        style.arrowTop = style.height;
        topBottom = true;
        break;

      // no default
    }

    switch (style.posClass[1]) {
      case 'right':
        if (topBottom) {
          style.left = config.left + config.box.width / 2 - this.config.offset - this.config.arrowSize;
          style.arrowLeft = this.config.offset;
        }
        else {
          style.left = config.left + config.box.width + this.config.offset + this.config.arrowSize;
          style.arrowLeft = -this.config.arrowSize * 2;
        }
        break;

      case 'center':
        style.left = config.left + config.box.width / 2 - style.width / 2;
        style.arrowLeft = style.width / 2 - this.config.arrowSize;
        break;

      case 'left':
        if (topBottom) {
          style.left = config.left - style.width + config.box.width / 2 + this.config.offset + this.config.arrowSize;
          style.arrowLeft = style.width - this.config.offset - this.config.arrowSize * 2;
        }
        else {
          style.left = config.left - style.width - this.config.offset - this.config.arrowSize;
          style.arrowLeft = style.width;
        }
        break;

      // no default
    }
  }

}
