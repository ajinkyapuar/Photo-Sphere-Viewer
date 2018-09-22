import * as utils from './utils';
import * as constants from './data/constants';
import { DEFAULTS } from './data/config';
import { TEMPLATES } from './data/templates';
import { ICONS } from './data/icons';
import { SYSTEM } from './data/system';
import { EASINGS } from './data/easings';
import { PSVError } from './PSVError';
import { PSVAnimation } from './PSVAnimation';
import { PhotoSphereViewer } from './PhotoSphereViewer';

PhotoSphereViewer.utils = utils;
PhotoSphereViewer.CONSTANTS = constants;
PhotoSphereViewer.DEFAULTS = DEFAULTS;
PhotoSphereViewer.TEMPLATES = TEMPLATES;
PhotoSphereViewer.ICONS = ICONS;
PhotoSphereViewer.SYSTEM = SYSTEM;
PhotoSphereViewer.EASINGS = EASINGS;
PhotoSphereViewer.PSVError = PSVError;
PhotoSphereViewer.PSVAnimation = PSVAnimation;

export default PhotoSphereViewer;
