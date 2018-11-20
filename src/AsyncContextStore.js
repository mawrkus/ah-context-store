/* eslint-disable class-methods-use-this, import/no-unresolved */

const asyncHooks = require('async_hooks');
const fs = require('fs');
const { format } = require('util');

const FD_STDOUT = 1;

/**
 * Asynchronous contexts.
 * Based on the async_hooks module, which provides an API to register callbacks tracking the
 * lifetime of asynchronous resources created inside a Node.js application.
 * @see https://nodejs.org/api/async_hooks.html
 */
class AsyncContextStore {
  /**
   * @param {Object} [debug]
   * @param {Boolean} [debug.hooks=false]
   * @param {Boolean} [debug.methods=false]
   */
  constructor({ debug } = { debug: { hooks: false, methods: false } }) {
    this._setupLogging({ debug });

    this._contexts = {};

    this._asyncHooks = asyncHooks;

    this._hook = this._asyncHooks.createHook({
      init: this._init.bind(this),
      before: this._before.bind(this),
      after: this._after.bind(this),
      destroy: this._destroy.bind(this),
      promiseResolve: this._promiseResolve.bind(this),
    });
  }

  /**
   * @return {Number} Number of contexts currently stored.
   */
  get size() {
    return Object.keys(this._contexts).length;
  }

  /**
   * @return {Object}
   */
  get store() {
    return this._contexts;
  }

  /**
   * Allow callbacks of the AsyncHook instance to call, clears the contexts store.
   * @return {AsyncContextStore}
   */
  enable() {
    this._contexts = {};
    this._hook.enable();
    return this;
  }

  /**
   * Disable listening for new asynchronous events, clears the contexts store.
   * @return {AsyncContextStore}
   */
  disable() {
    this._hook.disable();
    this._contexts = {};
    return this;
  }

  /**
   * Saves a value in the current context.
   * @param {String} key
   * @param {*} value
   */
  set(key, value) {
    const currentId = this._asyncHooks.executionAsyncId();

    if (!(currentId in this._contexts)) {
      this._contexts[currentId] = {};
    }

    this._contexts[currentId][key] = value;
  }

  /**
   * Retrieves a value from the current context.
   * @param {String} key
   * @return {*|Symbol} value
   */
  get(key) {
    const currentId = this._asyncHooks.executionAsyncId();
    const currentContext = this._contexts[currentId];

    if (currentContext && key in currentContext) {
      return currentContext[key];
    }

    return AsyncContextStore.NOT_FOUND;
  }

  /**
   * Helper.
   * @param {...any} args
   */
  log(...args) {
    fs.writeSync(FD_STDOUT, `${format(...args)}\n`);
  }

  /**
   * Helper.
   * @param {Number} [asyncId=this._asyncHooks.executionAsyncId()]
   */
  logContext(asyncId = this._asyncHooks.executionAsyncId()) {
    const currentContext = this._contexts[asyncId];
    this.log(`[${asyncId}] Async context ->`, currentContext);
  }

  /**
   * Helper.
   * @param {Number} [asyncId=this._asyncHooks.executionAsyncId()]
   */
  logStore() {
    this.log('%d context(s) in store ->', this.size);
    this.log(this.store);
  }

  /**
   * Creates a new context, called when a class is constructed that has the possibility to emit an
   * asynchronous event.
   * @param {Number} asyncId
   * @param {String} type
   * @param {Number} triggerAsyncId
   * @param {Object} resource
   */
  _init(asyncId, type, triggerAsyncId/* , resource */) {
    const currentId = type === 'PROMISE'
      ? this._asyncHooks.executionAsyncId()
      : triggerAsyncId;

    if (currentId in this._contexts) {
      this._contexts[asyncId] = {
        _parentId: currentId,
        ...this._contexts[currentId],
      };
    }
  }

  /**
   * @param {Number} asyncId
   */
  _before(/* asyncId */) {
  }

  /**
   * @param {Number} asyncId
   */
  _after(/* asyncId */) {
  }

  /**
   * @param {Number} asyncId
   */
  _destroy(asyncId) {
    if (asyncId in this._contexts) {
      delete this._contexts[asyncId];
    }
  }

  /**
   * @param {Number} asyncId
   */
  _promiseResolve(asyncId) {
    if (asyncId in this._contexts) {
      delete this._contexts[asyncId];
    }
  }

  /**
   * @param {Object} [debug]
   * @param {Boolean} [debug.hooks=false]
   * @param {Boolean} [debug.methods=false]
   */
  _setupLogging({ debug }) {
    if (debug.hooks) {
      ['init', 'before', 'after', 'destroy', 'promiseResolve'].forEach((callbackName) => {
        const methodName = `_${callbackName}`;
        const originalMethod = this[methodName].bind(this);

        this[methodName] = (...args) => {
          this._logHook(callbackName, ...args);
          return originalMethod(...args);
        };
      });

      this.log('AsyncContextStore -> hooks logging enabled.');
    }

    if (debug.methods) {
      const originalGet = this.get.bind(this);

      ['enable', 'disable', 'set', 'get'].forEach((methodName) => {
        const originalMethod = this[methodName].bind(this);

        this[methodName] = (...args) => {
          const currentId = this._asyncHooks.executionAsyncId();
          let logArgs = [`[${currentId}] AsyncContextStore.${methodName}(${args})`];
          let result;

          if (methodName === 'set') {
            logArgs = [...logArgs, '/ previous=', originalGet(args[0])];
            result = originalMethod(...args);
          } else if (methodName === 'get') {
            result = originalMethod(...args);
            logArgs = [...logArgs, '->', result];
          } else {
            result = originalMethod(...args);
          }

          this.log(...logArgs);

          return result;
        };
      });

      this.log('AsyncContextStore -> methods logging enabled.');
    }
  }

  /**
   * @param {String} callbackName
   * @param {Number} asyncId
   * @param {String} [type]
   * @param {Number} [triggerAsyncId]
   * @param {Object} [resource]
   */
  _logHook(...args) {
    const currentId = this._asyncHooks.executionAsyncId();
    const callbackName = args[0];

    if (callbackName === 'init') {
      this.log(`[${currentId}] AsyncResource.init -> triggerId=${args[3]}, type=${args[2]}, id=${args[1]}`);
    } else {
      this.log(`[${currentId}] AsyncResource.${callbackName} -> id=${args[1]}`);
    }
  }
}

AsyncContextStore.NOT_FOUND = Symbol('NotFound');

module.exports = AsyncContextStore;
