/*global extendFunction, $, shield, _, onuncaughtException */
/*
 
Wish jQuery would bark when you had a bad selector?
Maybe `$('#buttonn')` was a typo or `#button` actually
isn't on the page. Fail safely w/ `$('#button', failsafe)`

*/
function shield_jquery_js() {
  'use strict';

  if (window.failsafe) {
    console.log('looks like you already have a failsafe variable defined. ');
  } else {
    window.failsafe = 'failsafe';
  }

  // Don't like throwing errors? Define $.badSelectorAction to be whatever you want.
  function badSelectorAction( selector, context, originalResult ) {
    if (window.console && console.warn) {
      console.warn( 'empty selector:' + selector, context );
    }
    return originalResult;
  }
  $.badSelectorAction = badSelectorAction;

  //Feel free to stop reading here!
  extendFunction('$', function strictSelectorOverride( args, oldjQuery ) {
    var selector = args[0];
    var context = args[1];

    //if it's not a string or clearly html..
    if ( typeof selector !== 'string' ||
         ( selector.charAt(          0          ) === '<' &&
           selector.charAt( selector.length - 1 ) === '>' &&
           selector.length >= 3 )
       )
    {
      return oldjQuery.apply(this, arguments);
    }

    if ( context === 'failsafe' ) {
      return oldjQuery.call(this, selector); //don't do apply because context is 'failsafe'
    } else {
      var result = oldjQuery.apply(this, arguments);
      if (typeof result.length === 'number') {
        if (result.length > 0) {
          return result;
        } else {
          return $.badSelectorAction.call(this, selector, context, result);
        }
      } else {
        //.length is undefined or not a number, result is unknown, just return it.
        return result;
      }
    }
  });

  shield('$, $.fn.on, $.fn.ready');


  //get a stack trace for failed ajax requests
  extendFunction('$.ajax', function ajaxFailExtension(args, prevFunc) {
    try { // have to try/throw/catch to get stack in safari
      throw new Error('manually created stack');
    } catch (e) {
      var stackOnSend = e.stack;
    }
  
    //prevFunc is the original $.ajax
    //call that and store the value to return
    var ret = prevFunc.apply(this, args);
  
    // when we have a offline failure -> que -> retry when online system setup, we'll want to use this
    /* (https://gist.github.com/devinrhode2/4491219)
      //modify the fail function to only call failure callbacks if we are actually online.
      //If we are offline, que the request to re-try periodically, and then complete all the requests in the order initiatd
      ret.fail = extendFunction(ret.fail, function offlineRetryGuardFail(args) {
        //punting offline check/retry stuff
        if (offline
        //report
        if (typeof onuncaughtException !== 'undefined' && _.isFunction(onuncaughtException)) {
          onuncaughtException({stack: stackOnSend, message: args[0]});
        }
    
        //nothing returned, so extendFunction calls
        //the original fail function and returns
        //the value returned from it
      });
    */
  
    //add a fail callback that will log the stack leading up the to the failed request.
    //This will only fire for failures that happen when you're online, thanks to the above code (coming soon)
    ret.fail(function failCallbackWithStack() {
      console.error(
        /*                                                       Strip out our libraries' function calls                      */
        'ajax error! stack on send:' + stackOnSend.replace(/^ajaxFailExtension@[^\n]*/gim, '').replace('extendedFunc\n\n', ''),
        '\n\nargs:', arguments
      );
      if (arguments[2].message) {
        console.error(arguments[2].message);
      }
    });
    return ret;
  });
}

if (typeof $ !== 'undefined' && _.isFunction($)) {
  shield_jquery_js();
} else {
  console.warn('looks like $ is undefined, call shield_jquery_js() when jQuery is loaded');
}
