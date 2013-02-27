//old history: https://gist.github.com/devinrhode2/5022364
function extendFunction(fnRef, addedFunctionality) {
  var oldOldFn;
  if (Object.prototype.toString.call(fnRef) =='[object String]') {
    var s = fnRef.split('.');
    oldOldFn = window;
    while (s.length) {
      oldOldFn = oldOldFn[s.shift()];
    }
  } else if (Object.prototype.toString.call(fnRef) =='[object Function]') {
    oldOldFn = fnRef;
  }
 
  var newFunc = function() {
    var args = [].slice.call(arguments);
 
    var called = false;
    var oldFunction = function() {
      called = true;
      return oldOldFn.apply(this, [].slice.call(arguments));
      //could use `args` instead of `arguments`, but then we assume you aren't changing the args
      //and in fact, if you change the args you call oldFunction with, things won't work as expected
    };
 
    var newRet = addedFunctionality.call(this, args, oldFunction);
    if (!called) {
      called = false; // reset in case a function dynamically calls the oldFunction
      var oldRet = oldFunction.apply(this, args);
    }
 
    if (typeof newRet === 'undefined') {
      return oldRet;
    } else {
      return newRet;
    }
  };
 
  if (s && s.length === 0) {
    eval('window.' + fnRef + ' = ' + newFunc.toString());
  } else {
    return newFunc;
  }
}