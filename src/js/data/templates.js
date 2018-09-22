import * as doT from 'dot/doT';

import markersList from '../../templates/markers-list.html';

export const TEMPLATES = {
  markersList,
};

/**
 * @summary Crrate template functions from config
 * @param {Object<string, string|function>}options
 * @returns {Object<string, function>}
 */
export function getTemplates(options) {
  const templates = {};

  Object.keys(TEMPLATES).forEach((name) => {
    if (!options[name]) {
      templates[name] = doT.template(TEMPLATES[name]);
    }
    else if (typeof options[name] === 'function') {
      templates[name] = options[name];
    }
    else {
      templates[name] = doT.template(options[name]);
    }
  });

  return templates;
}
