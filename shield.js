/*! Shield.js v0.0.1 - Stack traces and moar - MIT licensed - https://github.com/Shield/shield.js */

// Let's var the library namespace, so you can keep the library to a certain scope, (and also use multiple versions)
// If any issues arise complaining that Shield is undefined (not on the global object) then we can address that when it arises

/**
 * exceptionalException
 * You know, for something that should really never occur
 */
var exceptionalException = function exceptionalExceptionFn(message) {
    'use strict';
    alert('HOLY MOLY! Please email this error to support@domain.com: \n\nSubject:Error\n' + message);
};

var Shield = (function shieldWrapper() { // I would be ok with omitting we didn't have "shieldWrapper" here
    'use strict';

    /**
     * Small case `shield` gets returned and assigned to `Shield`
     * Public functions should be attached to this object
     *
     * Comment blocks like this for multi-line comments
     */
    var shield = {};
    //could also call this shieldApi

    /**
     * Headers like this
     */

    // Private variables
    // IMO agree with @cowboy http://benalman.com/news/2012/05/multiple-var-statements-javascript/
    var alphabetically;
    var ordered;
    var var1;
    var var2;

    // Purely internal functions
    var doSomething = function doSomethingFn() {
        /**
         * Function names are good! But IE chokes when the name is the same as the identifier
         * Therefore, we should always add "Fn" to avoid IE errors
         * In general I've realized this is the best practice and lends itself to great stack traces
         */
        return 'doSomething';
    };

    // Semi-internal functions should still be exposed for flexibility:
    shield.normalize = function ShieldNormalizeFn(callback) {
        /**
         * Function names for methods
         * methods on an object should simply be the object name + method name camel-cased
         *
         * Note: Shield is capitalized because it gets assigned to `Shield`,
         *       otherwise "shieldNormalizeFn" would be a more consistent convention
         * Also, if you guys wanted we could omit "Fn" in these situations, but I think that's a more complex convention to try and stick too
         */
        if (callback == null) {
            // do synchronous normalization
            return {stack: []}
        } else {
            // Do async things like remote fetching, etc
            callback({
                stack: [],
                url: location.href
                //...
            });
        }
    };

    /**
     * @param arg {Error || Object || String}
     * @constructor
     */
    shield.report = function ShieldReportFn(arg) {
        //If object or string AND it has no stack property, add one by doing .stack = (new Error('force-added stack')).stack
        //Then:
        shield.normalize(function(jsonErrorReport){
            //send to subscribers
            //if no subscribers.. then throw an error or alert?
            //If we were to throw in this situation, I would call that an exceptionalException, and call that function above
        });
    };

    return shield;
})();

// ..So instead let's setup options like:
Shield.options = {
    foo: 'bar'
};