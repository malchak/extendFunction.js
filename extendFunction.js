function extendFunction(fnPropertyRef, addedFunctionality) {
  //not doing 'use strict' because it changes what `this` means, and extendFunction should be as seamless as possible
  //http://scriptogr.am/micmath/post/should-you-use-strict-in-your-production-javascript
  //'use strict';
  //however, if a global 'use strict' is leaked, you can expect we just use the `this` keyword.. (I wish I could solve your bugs for you, but I can't here)
  var undefined;
  var oldFn, propertyArray;
  if (Object.prototype.toString.call(fnPropertyRef) == '[object String]') {
    oldFn = (typeof window !== "undefined" ? window : global);
    propertyArray = fnPropertyRef.split('.');
    while (propertyArray.length) { //while it's not zero (zero is falsey in javascript)
      try {
        oldFn = oldFn[propertyArray[0]];
        //on last iteration, we assume oldFn is a function, and catch the error if it isn't
      } catch (e) {
        if (oldFn === undefined) {
          throw new Error(
            'Can\'t extend function ' + fnPropertyRef + ' because ' +
            fnPropertyRef.replace(propertyArray.join('.'), '').replace(/(\.$)/g, '') + ' is not defined'
          );
        } else {
          throw e;
        }
      }
      
      //remove first item since that's valid and we've accessed the property, and assigned that property to oldFn
      propertyArray.shift();
    }
  } else {
    //else fnPropertyRef is actually the oldFn, or at least we'll assume so and catch the error if it isn't
    oldFn = fnPropertyRef;
  }

  function extendedFunction() {
    var args = Array.prototype.slice.call(arguments); //we use Array.prototype.slice instead of [].slice because it doesn't instantiate a new array

    //modify oldFn to track if it was called
    var called = false;
    var orig_oldFn = oldFn;
    oldFn = function () {
      called = true;
      try {
        // should we store this above and then use that variable? I don't know
        return orig_oldFn.apply(this, Array.prototype.slice.call(arguments));
        //we use standard dynamic `arguments` instead of `args` because there are not necessarily always the same
        //if a user modifies the arguments they call originalFunction with (extendFunction(function(args, originalFunction){ .. ) then we have to respect that
      } catch (e) {
        //above we assume oldFn is a function if it's not a string (for efficiency) - here, we catch and correct if it wasn't a function.
        //yes, it's more efficient to originally assume it's a function
        if (Object.prototype.toString.call(orig_oldFn) != '[object Function]') {
          throw new Error(fnPropertyRef + ' is not a function. ' + fnPropertyRef + ' toString is:' +
                          orig_oldFn + ' and is of type:' + typeof orig_oldFn);
        } else {
          throw e;
        }
      }
    };

    var oldRet;
    var newRet = addedFunctionality.call(this, args, oldFn);
    if (!called) {
      called = false; // reset in case a function dynamically calls the oldFn
                      // TODO api to tell extendFunction that oldFn will be called asynchronously
      oldRet = oldFn.apply(this, args);
    }

    if (newRet === undefined) {
      return oldRet;
    } else {
      return newRet;
    }
  }
 
  if (propertyArray && propertyArray.length === 0) {
    eval('(typeof window !== "undefined" ? window : global).' + fnPropertyRef + ' = ' + extendedFunction.toString());
  } else {
    return extendedFunction;
  }
}
