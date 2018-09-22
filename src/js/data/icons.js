import compass from '../../icons/compass.svg';
import download from '../../icons/download.svg';
import fullscreenIn from '../../icons/fullscreen-in.svg';
import fullscreenOut from '../../icons/fullscreen-out.svg';
import gesture from '../../icons/gesture.svg';
import info from '../../icons/info.svg';
import mobileRotate from '../../icons/mobile-rotate.svg';
import pin from '../../icons/pin.svg';
import playActive from '../../icons/play-active.svg';
import play from '../../icons/play.svg';
import stereo from '../../icons/stereo.svg';
import zoomIn from '../../icons/zoom-in.svg';
import zoomOut from '../../icons/zoom-out.svg';

export const ICONS = {
  compass,
  download,
  fullscreenIn,
  fullscreenOut,
  gesture,
  info,
  mobileRotate,
  pin,
  play,
  playActive,
  stereo,
  zoomIn,
  zoomOut,
};

/**
 * @summary Gets icons from config
 * @param {Object<string, string>} options
 * @returns {Object<string, string>}
 */
export function getIcons(options) {
  const icons = {};

  Object.keys(ICONS).forEach((name) => {
    if (!options[name]) {
      icons[name] = ICONS[name];
    }
    else {
      icons[name] = options[name];
    }
  });

  return icons;
}
