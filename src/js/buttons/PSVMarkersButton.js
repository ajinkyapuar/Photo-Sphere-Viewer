import { AbstractButton } from './AbstractButton';

/**
 * Navigation bar markers button class
 * @extends module:components/buttons.AbstractButton
 * @memberof module:components/buttons
 */
export class PSVMarkersButton extends AbstractButton {

  static id = 'markers';
  static icon = 'pin';

  /**
   * @param {module:components.PSVNavbar} navbar
   */
  constructor(navbar) {
    super(navbar, 'psv-button--hover-scale psv-markers-button');
  }

  /**
   * @override
   */
  destroy() {
    super.destroy();
  }

  /**
   * @override
   * @description Toggles markers list
   */
  __onClick() {
    this.psv.hud.toggleMarkersList();
  }

}
