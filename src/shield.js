/*global _:false, extendFunction: false, historicalConsole: false, wrapInTryCatch: false*/
function wrapInTryCatch(fn) {
  return function() {
    try {
      var args = [].slice.call(arguments);
      //setTimeout and setInterval in IE don't have an apply method
      return ( fn.apply ? fn.apply(this, args) : fn(args[0], args[1]) );
    } catch (e) {
      //probably window.onuncaughtException but maybe not. you can var over it
      if (typeof onuncaughtException !== 'undefined' && Object.prototype.toString.call(onuncaughtException) == '[object Function]') {
        onuncaughtException(e);
      } else {
        typeof console !== 'undefined' && console.warn && console.warn(
          'You should define a window.onuncaughtException handler for exceptions, ' +
          'or use a library like Sheild.js'
        );
        throw e;
      }
    }
  };
}

(function shieldJS() {
  'use strict';

  /**
  
  shield, the main function, does a few things:
  
  1. Wraps a callback in a try/catch block:
     shield(function(){
       //your program
     })();
  
  2. Optionally include a `console` param to use our historicalConsole
     shield(function(console){
       
     })();
     For documentation regarding keeping a console history, see https://github.com/devinrhode2/historicalConsole.js
  
  3. Modify global api functions so their callbacks are also wrapped in a try/catch block:
     shield('$');
     shield('$, $.fn.on, $.fn.ready')
     Now errors in these callbacks will be caught:
     $(function(){})
     $('#foo').on('click', function(){})
     $(document).ready(function(){})
  
  4. Use it for easier try/catch blocks. Instead of:
     var func = function() {
       //your function
     };
  
     add shield:
     var func = shield(function(){
       //no need for a try/catch block now, shield has it taken care of
     });
  
  @module shield
  @main shield
  @class shield
  @static shield
  @type Function
  @param {Mixed} apiFn A string like 
  @param {String} [promises] Space or comma-space separated list of functions to shield
  @return {Function} A function that will have all exceptions caught and sent to
    onuncaughtError (which shield.js defines - so they are sent to shield unless
    you shield.unsubscribe(shield.report) or re-define window.onuncaughtError
  */

  function shield(apiFn, promises) {
    if (_.isString(apiFn)) {
      if (apiFn.indexOf(' ') > -1) {
        apiFn.replace(/\,/g, ''); //allow '$, $.fn.on, $.fn.ready'
        apiFn = apiFn.split(' ');
      }
    }
    if (_.isArray(apiFn)) {
      _.each(apiFn, function(api){
        shield(api);
      });
      return;
    }
    return wrapInTryCatch(extendFunction(apiFn, function(args, prevFunc) {
      apiFn = null;//garbage collected

      //if function.length (number of listed parameters) is 1, and there are no args, then this is
      //shield(function(console){})()
      //ie, prevFunc expects 1 arg (length) but received none when called
      if (prevFunc.length === 1 && args.length === 0) {

        //verify a 'console' param
        var prevFnString = prevFunc.toString();
        var firstParen = prevFnString.indexOf('(');
        var secondParen = prevFnString.indexOf(')', firstParen);
        if (prevFnString.substring(firstParen, secondParen).indexOf('console') > -1 && typeof historicalConsole !== 'undefined') {
          //historicalConsole takes in a function and returns one that will receive the first arg as the console.
          //The second arg is a unique identifier to use another scope's historical console object
          //options.url is probably a deent unique identifier.
          //We could ask the user to name the app (shield.options.appName('thing')
          return historicalConsole(prevFunc/*, options.url*/);
        } else {
          return prevFunc;
        }
      } else {
        //instead of just doing apiFn.apply, we interate through args
        //and if an arg is a function then we wrap then we swap that fn for callback in a try/catch
        var length = args.length;
        //before executing the overriden function, transform each function arg to have a try/catch wrapper
        //I'd prefer to keep the while/length style iteration here for performance, since this can be rather important
        var arg;
        while (arg = args[--length]) {
          if (_.isFunction(arg)) {
            arg = wrapInTryCatch(arg);
          }
        }

        //now we apply the modified arguments:
        var ret = prevFunc.apply(this, args);
        if (promises) {
          promises = promises.split(' ');
          var promise;
          while(promise = promises.pop()) {
            ret[promise] = shield(ret[promise]);
          }
        }
        return ret;
      }
    }));
  }

  function shield_normalize(callback) {
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
   * @method shield_report
   * @param arg {Error || Object || String}
   * @constructor
   */
  function shield_report(/* arg */) {
    //If object or string AND it has no stack property, add one by doing .stack = (new Error('force-added stack')).stack
    shield.normalize(function(/* jsonErrorReport */) {
      //send to subscribers
      //if no subscribers.. then throw an error or alert?
      //If we were to throw in this situation, I would call that an exceptionalException, and call that function above
    });
  }

  /**
   * shield.noConflict: Export shield out to another variable
   * Example: myModule.shield = shield.noConflict();
   */
  var oldShield = window.shield;
  function shield_noConflict() {
    window.shield = oldShield;
    return shield;
  }

  //assiging one static object to the prototype instead of property by property is faster in V8
  //performance is the same in other browsers, except FF which is way faster than everyone else
  //and therefore doesn't matter as much. http://jsperf.com/props-or-proto-on-fns
  shield.prototype = {
    report: shield_report,
    normalize: shield_normalize,
    noConflict: shield_noConflict
  };

  window.shield = shield;
})();
