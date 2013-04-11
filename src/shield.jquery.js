/*
 
Wish jQuery would bark when you had a bad selector?
Maybe `$('#buttonn')` was a typo or `#button` actually
isn't on the page. Fail safely w/ `$('#button', failsafe)`
 
Documentation and options inline
*/
;(function strictjQuery() {
  
  if (typeof window.failsafe !== 'undefined') {
    console.log('looks like you already have a failsafe variable defined. ')
  } else {
    window.failsafe = 'failsafe';
  }
 
  // Don't like throwing errors? Define $.badSelectorAction to be whatever you want.
  function badSelectorAction( selector, context, originalResult ) {
    if (window.console && console.error) {
      console.error( selector, context );
    }
    return originalResult;
  }
  $.badSelectorAction = badSelectorAction;
  
  //Feel free to stop reading here!
  extendFunction('$', function strictSelectorOverride( args, oldjQuery ) {
    var selector = args[0];
    var context = args[1];

    //if it's not a string or clearly html..
    if ( typeof selector !== 'string'
         || ( selector.charAt(          0          ) === '<' &&
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
})();

shield('$, $.fn.on, $.fn.ready');

extendFunction('$.ajax', function(args, prevFunc) {
  var stackOnSend = new Error('manually created stack').stack;

  //prevFunc is the original $.ajax
  //call that and store the value to return
  var ret = prevFunc.apply(this, args);
  ret.fail = extendFunction(ret.fail, function(args) {
    //punting offline check/retry stuff
    //report
    if (typeof onuncaughtException !== 'undefined' && _.isFunction(onuncaughtException)) {
      onuncaughtException({stack: e.stack, message: args[0]);
    }

    //nothing returned, so extendFunction calls
    //the original fail function and returns
    //the value returned from it
  });
  return ret;
});