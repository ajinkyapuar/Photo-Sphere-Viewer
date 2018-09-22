/**
 * Navigation bar autorotate button class
 * @extends module:components/buttons.AbstractButton
 * @memberof module:components/buttons
 */
import { AbstractButton } from './AbstractButton';

export class PSVAutorotateButton extends AbstractButton {

  static id = 'autorotate';
  static icon = 'play';
  static iconActive = 'play-active';

  /**
   * @param {module:components.PSVNavbar} navbar
   */
  constructor(navbar) {
    super(navbar, 'psv-button--hover-scale psv-autorotate-button');

    this.psv.on('autorotate', this);
  }

  /**
   * @override
   */
  destroy() {
    this.psv.off('autorotate', this);

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
      case 'autorotate': this.toggleActive(e.args[0]); break;
      // @formatter:on
    }
    /* eslint-enable */
  }

  /**
   * @override
   * @description Toggles autorotate
   */
  __onClick() {
    this.psv.toggleAutorotate();
  }

}
