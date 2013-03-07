/*global _:false, extendFunction: false, historicalConsole: false, wrapInTryCatch: false*/

/**
 * @method exceptionalException
 *
 * exceptionalException
 * You know, for something that should REALLY never occur
 */
var exceptionalException = function exceptionalExceptionFn(message) {
  alert('HOLY MOLY! Please email this error to support@' + location.host + ': \n\nSubject:Error\n' + message);
};

(function ShieldJS() {
  'use strict';

  /**
  
  Sheild, the main function, does a few things:
  
  1. Wraps a callback in a try/catch block:
     Sheild(function(){
       //your program
     })();
  
  2. Optionally include a `console` param to use our historicalConsole
     Shield(function(console){
       
     })();
     For documentation regarding keeping a console history, see https://github.com/devinrhode2/historicalConsole.js
  
  3. Modify global api functions so their callbacks are also wrapped in a try/catch block:
     Shield('$');
     Shield('$, $.fn.on, $.fn.ready')
     Now errors in these callbacks will be caught:
     $(function(){})
     $('#foo').on('click', function(){})
     $(document).ready(function(){})
  
  4. Use it for easier try/catch blocks. Instead of:
     var func = function() {
       //your function
     };
  
     add Shield:
     var func = Shield(function(){
       //no need for a try/catch block now, Shield has it taken care of
     });
  
  @module Shield
  @main Shield
  @class Shield
  @static asdf
  @type Function
  @param {Mixed} apiFn A string like 
  @param {String} [promises] Space or comma-space separated list of functions to Shield
  @return {Function} A function that will have all it's errors caught
  @return {Function} A function that will have all exceptions sent to onuncaughtError (which Shield.js defines - so they are sent to Shield unless you Shield.unsubscribe(Shield.report) or re-define window.onuncaughtError
  */

  function Shield(apiFn, promises) {
    if (_.isString(apiFn)) {
      if (apiFn.indexOf(' ') > -1) {
        apiFn.replace(/\,/g, ''); //allow '$, $.fn.on, $.fn.ready'
        apiFn = apiFn.split(' ');
      }
    }
    if (_.isArray(apiFn)) {
      _.each(apiFn, function(api){
        Shield(api);
      });
      return;
    }
    return extendFunction(apiFn, function(args, prevFunc) {
      apiFn = null;//garbage collected

      //if function.length (number of listed parameters) is 1, and there are no args, then this is
      //Shield(function(console){})()
      //ie, prevFunc expects 1 arg (length) but received none when called
      if (prevFunc.length === 1 && args.length === 0) {

        //verify a 'console' param
        var prevFnString = prevFunc.toString();
        var firstParen = prevFnString.indexOf('(');
        var secondParen = prevFnString.indexOf(')', firstParen);
        if (prevFnString.substring(firstParen, secondParen).indexOf('console') > -1) {
          //historicalConsole takes in a function and returns one that will receive the first arg as the console.
          //The second arg is a unique identifier to use another scope's historical console object
          //options.url is probably a deent unique identifier.
          //We could ask the user to name the app (Shield.options.appName('thing')
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
            ret[promise] = Shield(ret[promise]);
          }
        }
        return ret;
      }
    });
  }

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

  /**
   * Shield.noConflict: Export Shield out to another variable
   * Example: myModule.Shield = Shield.noConflict();
   */
  var oldShield = window.Shield;
  function Shield_noConflict() {
    window.Shield = oldShield;
    return Shield;
  }

  //assiging one static object to the prototype instead of property by property is faster in V8
  //performance is the same in other browsers, except FF which is way faster than everyone else
  //and therefore doesn't matter as much. http://jsperf.com/props-or-proto-on-fns
  Shield.prototype = {
    report: Shield_report,
    normalize: Shield_normalize,
    noConflict: Shield_noConflict
  };

  window.Shield = Shield;
})();