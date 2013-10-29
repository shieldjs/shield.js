/*global _:false, extendFunction: false, historicalConsole: false, wrapInTryCatch: false*/

// exceptionalException doesn't need to be part of stack traces, so
// var expr = function works instead of function declarations(){}
var exceptionalException = function(message) {
  'use strict';

  // alias:
  var ee = exceptionalException;
  ee.confirmDialogMessage || (ee.confirmDialogMessage = 'Email error? \n\nWe had a serious issue and were not able to automatically report an error. Click "ok" to send an email about the error so we can fix it.');
  ee.domain || (
    ee.domain = location.hostname.split('.'),
    ee.domain = '@' + ee.domain[ee.domain.length - 2] + '.' + ee.domain[ee.domain.length - 1]
  );
  ee.mailtoParams || (ee.mailtoParams = {});
  ee.mailtoParams.subject || (ee.mailtoParams.subject = 'Automated error report failed, here\'s a manual one');
  ee.mailtoParams.body    || (ee.mailtoParams.body    = 'I found some javascript errors, they are listed below:\n\n');

  ee.stringifyHash || (ee.stringifyHash = stringifyHash);
  function stringifyHash(hash) {
    var result = '';
    for (var key in hash) {
      result += key + ': ' + hash[key];
    }
    return result;
  }

  var receivedErrorMessages = {};
  var lastReceivedMessage = message;

  exceptionalException = function(message) {
    if (ee.emailErrors !== false) {
      ee.emailErrors = confirm(ee.confirmDialogMessage);
    }

    if (receivedErrorMessages[message]) return 'already received this error message';

    if (ee.emailErrors) {

      if (!_.isString(message)) {
        //ensure stack property is computed
        message.stack;
        message = ee.stringifyHash(message); //
      }

      receivedErrorMessages[message] = true;
      lastReceivedMessage = message;
      ee.mailtoParams.body += '\n\n' + message;

      (function(lastMessageAtStartOfTimeout){
        setTimeout(function(){
          if (lastMessageAtStartOfTimeout === lastReceivedMessage) {

            //re-use message variable under alias
            var finalUrl = message;

            for (var param in ee.mailtoParams) {
              if (ee.mailtoParams.hasOwnProperty(param)) {
                finalUrl += param + '=' + encodeURIComponent(ee.mailtoParams) + '&';
              }
            }
            finalUrl = 'mailto:unrecordedJavaScriptError@' + ee.domain + ',support@' + ee.domain + '?' + finalUrl;

            //window.open arguments taken from twitters tweet button
            if (!window.open(finalUrl, null, 'scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=420,left=445,top=240')) {
              //hopefully the window.open works. If it doesn't, and we synchronously received another error
              location.href = finalUrl;
              //if reported errors is the same from when we being the timer to when we end the timer,
            }
          }
        }, 100);
      })(lastReceivedMessage);
    }
  };
  return exceptionalException(message); //just don't need to do .apply here.
};

function wrapInTryCatch(func) {
  function wrappedFunction() {
    try {
      return func.apply(this, Array.prototype.slice.call(arguments) );
    } catch (uncaughtException) {

      // in the event of an uncaught exception, try to send the exception to onuncaughtException
      try {
        onuncaughtException(uncaughtException);

        // I use this gnarly try-catch structure instead of several if checks for efficiency
      } catch (exceptionCallingOnUncaughtException) {
        // however, if there's a problem with THAT........

        // First check if it's even defined:
        if (typeof onuncaughtException === 'undefined') {

          // Prompt to define accordingly:
          if (typeof console !== 'undefined' && console.warn) {
            console.warn('You should define an onuncaughtException handler for exceptions, SON.');
          } else if (typeof confirm !== 'undefined' && wrapInTryCatch.defineDialogs !== false) {
            wrapInTryCatch.defineDialogs = confirm('Please define an uncaughtException handler');
          }
          throw e; // will hit window.onerror.
                   // We could also manually call window.onerror with the same arguments each time so it can be programmed against

        } else { // apparently `onuncaughtException` IS DEFINED...
          if (Object.prototype.toString.call(onuncaughtException) != '[object Function]') {
            exceptionalException(new TypeError('onuncaughtException is not a function'));
          } else {
            exceptionalException(exceptionCallingOnUncaughtException);
          }
        }

      } // for catch exceptionCallingOnUncaughtException
    } // for catch uncaughtException
  }
  return wrappedFunction;
}

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
@param apiFn {String || Function} A string must represent a global function like `'$'`, or a space/comma-space seperated list like `'$, $.fn.ready'` <br>
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
   * @method normalize
   * @param error {Error} an
   */
  function shield_normalize(error, callback) {
    if (callback == null) {
      // do synchronous normalization
      return {stack: []};
    }
  }

  /**
   * @method report
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
    return;
  }
  return shield.wrapInTryCatch(extendFunction(apiFn, function(args, prevFunc) {
    apiFn = null;//garbage collected

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

  //assiging one static object to the prototype instead of property by property is faster in V8
  //performance is the same in other browsers, except FF which is way faster than everyone else
  //and therefore doesn't matter as much. http://jsperf.com/props-or-proto-on-fns
  shield.prototype = {
    report: shield_report,
    normalize: shield_normalize,
    noConflict: shield_noConflict
  };

  window.shield = shield;
})(this);