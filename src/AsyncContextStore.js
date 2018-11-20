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
   * @param {Sring[]} [debug=[]] ['methods', 'hooks]
   */
  constructor({ debug } = { debug: [] }) {
    this._contexts = {};

    this._asyncHooks = asyncHooks;

    this._hook = this._asyncHooks.createHook({
      init: (...args) => this._init(...args),
      before: (...args) => this._before(...args),
      after: (...args) => this._after(...args),
      destroy: (...args) => this._destroy(...args),
      promiseResolve: (...args) => this._promiseResolve(...args),
    });

    this._setupLogging({ debug });
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
   */
  enable() {
    this._contexts = {};
    this._hook.enable();
  }

  /**
   */
  disable() {
    this._hook.disable();
    this._contexts = {};
  }

  /**
   * @param {String} key
   * @param {*} value
   */
  set(key, value) {
    const currentId = this._asyncHooks.executionAsyncId();
    const currentContext = this._contexts[currentId];

    if (!currentContext) {
      this._contexts[currentId] = {
        parentId: null,
        data: {},
      };
    }

    this._contexts[currentId].data[key] = value;
  }

  /**
   * @param {String} key
   * @return {*} value
   */
  get(key) {
    const currentId = this._asyncHooks.executionAsyncId();
    let currentContext = this._contexts[currentId];
    let value;

    while (currentContext) {
      const { parentId, data } = currentContext;

      if (key in data) {
        value = data[key];
        break;
      }

      currentContext = this._contexts[parentId];
    }

    return value;
  }

  /**
   * @param {...any} args
   * @return {AsyncContextStore} this
   */
  log(...args) {
    const currentId = this._asyncHooks.executionAsyncId();
    fs.writeSync(FD_STDOUT, `[${currentId}] ${format(...args)}\n`);
    return this;
  }

  /**
   * @return {AsyncContextStore} this
   * @param {Number} [asyncId=this._asyncHooks.executionAsyncId()]
   */
  logContext(asyncId = this._asyncHooks.executionAsyncId()) {
    const currentContext = this._contexts[asyncId];
    this.log(`Async context [${asyncId}] ->`, currentContext);
    return this;
  }

  /**
   * @return {AsyncContextStore} this
   */
  logStore() {
    this.log(`${this.size} context(s) in store ->`, this.store);
    return this;
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
    const parentId = triggerAsyncId/* || this._asyncHooks.executionAsyncId() */;

    this._contexts[asyncId] = {
      parentId,
      data: {},
    };
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
  _promiseResolve(/* asyncId */) {
  }

  /**
   * @param {String[]} debug ['hooks', 'methods']
   */
  _setupLogging({ debug }) {
    if (debug.includes('hooks')) {
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

    if (debug.includes('methods')) {
      ['enable', 'disable', 'set', 'get'].forEach((methodName) => {
        const originalMethod = this[methodName].bind(this);

        this[methodName] = (...args) => {
          const result = originalMethod(...args);
          this.log(`AsyncContextStore.${methodName}(${args}) ->`, result);
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
    const callbackName = args[0];

    if (callbackName === 'init') {
      this.log(`* init: ${args[3]} -> ${args[1]} (${args[2]})`);
    } else {
      this.log(`* ${callbackName} ${args[1]}`);
    }
  }
}

module.exports = AsyncContextStore;
