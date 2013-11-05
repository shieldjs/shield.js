/*global _:false, extendFunction: false, historicalConsole: false*/


(function shieldJS(global) {
  'use strict';

  // IE < 9 doesn't support .call/.apply on setInterval/setTimeout, but it
  // also only supports 2 argument and doesn't care what "this" is, so we
  // can just call the original function directly.
  function applyPatch(irrelevantThis, args) {
    return this(args[0], args[1]);
  }
  if (!setTimeout.apply) {
    setTimeout.apply = applyPatch;
  }
  if (!setInterval.apply) {
    setInterval.apply = applyPatch;
  }

/**

## The main `shield` function does a few things:


1. Wraps a callback in a try/catch block:

```
shield(function(){
    //your program
})();
```

2. Optionally include a `console` param to use our historicalConsole

```
shield(function(console){
})();
```

For documentation regarding keeping a console history, see
<a href="https://github.com/devinrhode2/historicalConsole.js">github.com/devinrhode2/historicalConsole.js</a>
<br /><br />

3. Modify global api functions so their callbacks are also wrapped in a try/catch block:

```
shield('$');
shield('$, $.fn.on, $.fn.ready


//Now errors in these callbacks will be caught, and there's no need for a try/catch block:
$(function(){})
$('#foo').on('click', function(){})
$(document).ready(function(){})
```

4. Use it for easier try/catch blocks. Instead of:

```
var func = function() {
    //your function
};

// add shield:
var func = shield(function(){
    //no need for a try/catch block now, shield has it taken care of
});
```

### Do not invoke with `new`


@class shield
@constructor shield
@type Function
@param apiFn {String || Function || Array} A string must represent a global function like `'$'`, or a space/comma-space seperated list like `'$, $.fn.ready'` <br>
  Pass in a function, and it will be shieled and returned. `shield`'ing means this function and callbacks
  passed as parameters to it will have all exceptions sent to onuncaughtError, or shield subscribers. (example 4)
@param {String} [promises] Space or comma-space separated list of promise functions to shield (like $.ajax().done)
@return {Function} A function that will have all uncaught exceptions sent to your shield.js subscribers, or onuncaughtException if you overwrote the function. You shield.unsubscribe(shield.report)
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

  /**
   * Export shield out to another variable, e.g., `myModule.shield = shield.noConflict();`
   *
   * @method noConflict
   * @namespace shield
   * @return {Function} the currently defined window.shield (now defined to the previous
       window.shield, which may or may not be defined)
   */
  var oldShield = window.shield;
  function shield_noConflict() {
    window.shield = oldShield;
    return shield;
  }


  function shield_wrap(func) {
    // Define a function that simply returns what func returns, and forwards the arguments
    function wrappedFunction() {
      try {
        /**
        If someone does new SomeWrappedFunction(),
        the value of this is an instanceof wrappedFunction.

        But thanks to the line at the bottom of wrapInTryCatch,
        wrappedFunction is an instanceof the original function,

        `this` gets all the right properties, but a resulting objects properties may not
        be it's *own* properties.. well this check shows there are zero side effects:

        function printThis() {
          this.prop = 'this.prop value!';
          console.log('this:', this);
          console.log('this.proto:', this.prototype);
        }
        printThis.prototype.protoProp = 'protoProp value!';
        function printProperties(obj) {
          for (var p in obj) {
            console.log(
              (obj.hasOwnProperty(p) ? '... OWNED ' : 'NOT OWNED ') + p + ': ' + obj[p]
            );
          }
        }
        printThis();
        printProperties(new printThis());
        printThis = wrapInTryCatch(printThis);
        printThis();
        printProperties(new printThis());
        */
        return func.apply(this, Array.prototype.slice.call(arguments) );
      } catch (uncaughtException) {
        fireUncaughtExceptionEvent(uncaughtException);
      }
    }
    //preserve function.length since wrappedFunction doesn't list arguments!
    wrappedFunction.length = func.length;
    //maintain prototype chain, but not necessarily extend. Extending would be like new Error I think.
    wrappedFunction.prototype = func.prototype;
    //I'm pretty sure if someone does `new wrapInTryCatch(..)` nothing different happens at all.
    return wrappedFunction;
  }

  shield.wrap = shield_wrap;
  shield.report = shield_report;
  shield.noConflict = shield_noConflict;

  window.shield = shield;
})(this);