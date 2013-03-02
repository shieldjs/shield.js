/*! Shield.js v0.0.1 - Stack traces and moar - MIT licensed - https://github.com/Shield/shield.js */

/**
 * @method exceptionalException
 *
 * exceptionalException
 * You know, for something that should REALLY never occur
 */
var exceptionalException = function exceptionalExceptionFn(message) {
  'use strict';
  alert('HOLY MOLY! Please email this error to support@domain.com: \n\nSubject:Error\n' + message);
};

/**
 * @class Shield
 */
var Shield = (function shieldWrapper() {
  'use strict';

  function Shield_normalize(callback) {
    if(callback == null) {
      // do synchronous normalization
      return {stack: []};
    }
    // Do async things like remote fetching, etc
    return callback({
      stack: [],
      url: location.href
      //...
    });
  }

  /**
   * @method Shield_report
   * @param arg {Error || Object || String}
   * @constructor
   */
  function Shield_report(arg) {
    //If object or string AND it has no stack property, add one by doing .stack = (new Error('force-added stack')).stack
    Shield.normalize(function(jsonErrorReport) {
      //send to subscribers
      //if no subscribers.. then throw an error or alert?
      //If we were to throw in this situation, I would call that an exceptionalException, and call that function above
    });
  }

  return {
    report: Shield_report,
    normalize: Shield_normalize
  };
})();

Shield.options = {
  foo: 'bar'
};
