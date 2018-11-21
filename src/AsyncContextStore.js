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
   * @param {String[]} [debug=[]] ['methods', 'hooks]
   */
  constructor({ debug = [] } = { debug: [] }) {
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
   * @return {AsyncContextStore} this
   */
  enable() {
    this._contexts = {};
    this._hook.enable();
    return this;
  }

  /**
   * @return {AsyncContextStore} this
   */
  disable() {
    this._hook.disable();
    this._contexts = {};
    return this;
  }

  /**
   * @param {String} key
   * @param {*} value
   * @return {AsyncContextStore} this
   */
  set(key, value) {
    const currentId = this._asyncHooks.executionAsyncId();
    let currentContext = this._contexts[currentId];

    if (!currentContext) {
      currentContext = this._contexts[currentId] = { // eslint-disable-line no-multi-assign
        parentId: this._asyncHooks.triggerAsyncId(),
        data: {},
      };
    }

    currentContext.data[key] = value;

    return this;
  }

  /**
   * @param {String} key
   * @return {*} value
   */
  get(key) {
    const currentId = this._asyncHooks.executionAsyncId();
    const currentContext = this._contexts[currentId];

    return currentContext && (key in currentContext.data)
      ? currentContext.data[key]
      : undefined;
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

    const currentContext = this._contexts[currentId];

    if (currentId in this._contexts) {
      this._contexts[asyncId] = {
        parentId: currentId,
        data: currentContext.data,
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
   * @param {...any} args
   * @return {AsyncContextStore} this
   */
  log(...args) {
    fs.writeSync(FD_STDOUT, `${format(...args)}\n`);
    return this;
  }

  /**
   * @param {Number} [asyncId=this._asyncHooks.executionAsyncId()]
   * @return {AsyncContextStore} this
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
    this.log(`${this.size} context(s) in store ->`);
    this.log(this.store);
    return this;
  }

  /**
   * @param {String[]} debug ['hooks', 'methods']
   */
  _setupLogging({ debug }) {
    if (debug.includes('hooks')) {
      const originalInitMethod = this._init.bind(this);
      this._init = (...args) => {
        this.log(` * init: ${args[2]} -> ${args[0]} (${args[1]})`);
        return originalInitMethod(...args);
      };

      const logSymbols = {
        before: '>',
        after: '<',
        destroy: 'x',
        promiseResolve: 'v',
      };

      ['before', 'after', 'destroy', 'promiseResolve'].forEach((callbackName) => {
        const methodName = `_${callbackName}`;
        const originalMethod = this[methodName].bind(this);
        this[methodName] = (...args) => {
          this.log(` ${logSymbols[callbackName]} ${callbackName} ${args[0]}`);
          return originalMethod(...args);
        };
      });

      this.log('AsyncContextStore -> hooks logging enabled.');
    }

    if (debug.includes('methods')) {
      ['enable', 'disable', 'set'].forEach((methodName) => {
        const originalMethod = this[methodName].bind(this);
        this[methodName] = (...args) => {
          const currentId = this._asyncHooks.executionAsyncId();
          this.log(`[${currentId}] AsyncContextStore.${methodName}(${args})`);
          return originalMethod(...args);
        };
      });

      ['get'].forEach((methodName) => {
        const originalMethod = this[methodName].bind(this);

        this[methodName] = (...args) => {
          const currentId = this._asyncHooks.executionAsyncId();
          const result = originalMethod(...args);
          this.log(`[${currentId}] AsyncContextStore.${methodName}(${args}) ->`, result);
          return result;
        };
      });

      this.log('AsyncContextStore -> methods logging enabled.');
    }
  }
}

module.exports = AsyncContextStore;
