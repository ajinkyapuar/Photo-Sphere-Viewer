import { AbstractButton } from './AbstractButton';

/**
 * Navigation bar caption button class
 * @extends module:components/buttons.AbstractButton
 * @memberof module:components/buttons
 */
export class PSVCaptionButton extends AbstractButton {

  static id = 'caption';
  static icon = 'info';

  /**
   * @param {module:components.PSVNavbarCaption} caption
   */
  constructor(caption) {
    super(caption, 'psv-button--hover-scale psv-caption-button');

    this.psv.on('hide-notification', this);
  }

  /**
   * @override
   */
  destroy() {
    this.psv.off('hide-notification', this);

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
      case 'hide-notification': this.toggleActive(false); break;
      // @formatter:on
    }
    /* eslint-enable */
  }

  /**
   * @override
   * @description Toggles markers list
   */
  __onClick() {
    if (this.psv.notification.isNotificationVisible()) {
      this.psv.notification.hideNotification();
    }
    else {
      this.psv.notification.showNotification(this.parent.prop.caption);
      this.toggleActive(true);
    }
  }

}
