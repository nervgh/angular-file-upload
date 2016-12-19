'use strict';


const {
  bind,
  isUndefined
} = angular;


export default function __identity($q) {


  return class Pipeline {
    /**
     * @param {Array<Function>} pipes
     */
    constructor(pipes = []) {
      this.pipes = pipes;
    }
    next(args) {
      let pipe = this.pipes.shift();
      if (isUndefined(pipe)) {
        this.onSuccessful(...args);
        return;
      }
      let err = new Error('The filter has not passed');
      err.pipe = pipe;
      err.args = args;
      if (pipe.isAsync) {
        let deferred = $q.defer();
        let onFulfilled = bind(this, this.next, args);
        let onRejected = bind(this, this.onThrown, err);
        deferred.promise.then(onFulfilled, onRejected);
        pipe(...args, deferred);
      } else {
        let isDone = Boolean(pipe(...args));
        if (isDone) {
          this.next(args);
        } else {
          this.onThrown(err);
        }
      }
    }
    exec(...args) {
      this.next(args);
    }
    onThrown(err) {

    }
    onSuccessful(...args) {

    }
  }
  
}

__identity.$inject = [
  '$q'
];