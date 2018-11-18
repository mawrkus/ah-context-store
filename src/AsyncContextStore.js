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
    if (debug.hooks) {
      ['_init', '_before', '_after', '_destroy'].forEach((methodName) => {
        const originalMethod = this[methodName].bind(this);

        this[methodName] = (...args) => {
          this.log(`AsyncContextStore.${methodName}`, ...args);
          return originalMethod(...args);
        };
      });

      this.log('AsyncContextStore -> hooks logging enabled.');
    }

    if (debug.methods) {
      const originalSet = this.set.bind(this);

      this.set = (key, value) => {
        const currentId = asyncHooks.executionAsyncId();
        this.log(`[${currentId}] AsyncContextStore.set('${key}', ${value})`);
        return originalSet(key, value);
      };

      const originalGet = this.get.bind(this);

      this.get = (key) => {
        const value = originalGet(key);
        const currentId = asyncHooks.executionAsyncId();
        this.log(`[${currentId}] AsyncContextStore.get('${key}') -> ${value}`);
        return value;
      };

      this.log('AsyncContextStore -> methods logging enabled.');
    }

    this._hook = asyncHooks.createHook({
      init: this._init.bind(this),
      before: this._before.bind(this),
      after: this._after.bind(this),
      destroy: this._destroy.bind(this),
    });

    this._store = new Map();
  }

  /**
   * @return {Number} Number of elements
   */
  get size() {
    return this._store.size;
  }

  /**
   * @return {Map}
   */
  get data() {
    return this._store;
  }

  /**
   * Initialize a new (root) context & allow callbacks of the AsyncHook instance to call.
   * @param {Boolean} [createRootContext=true]
   * @return {AsyncContextStore}
   */
  enable(createRootContext = true) {
    if (createRootContext) {
      const currentId = asyncHooks.executionAsyncId();

      this._store.set(currentId, {
        _parentId: null,
        context: {},
      });
    }

    this._hook.enable();

    return this;
  }

  /**
   * Disable listening for new asynchronous events and clears the contexts store.
   * @param {Boolean} [clear=true]
   * @return {AsyncContextStore}
   */
  disable(clearAll = true) {
    this._hook.disable();

    if (clearAll) {
      this._store.clear();
    }

    return this;
  }

  /**
   * Saves a value in the current context.
   * @param {String} key
   * @param {*} value
   * @return {*} value
   */
  set(key, value) {
    const currentId = asyncHooks.executionAsyncId();
    const { context } = this._store.get(currentId);
    context[key] = value;
    return value;
  }

  /**
   * Lookups for a value in the chain going from the current context up to the root context.
   * @param {String} key
   * @return {*} value
   */
  get(key) {
    let value;
    let currentId = asyncHooks.executionAsyncId();
    let found = false;

    while (currentId) {
      const { context, _parentId } = this._store.get(currentId);

      found = key in context;
      if (found) {
        value = context[key];
        break;
      }

      currentId = _parentId;
    }

    return value;
  }

  /**
   * @param {*}
   */
  log(...args) {
    fs.writeSync(FD_STDOUT, `${format(...args)}\n`);
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
    this._store.set(asyncId, {
      _parentId: triggerAsyncId,
      // _type: type,
      // _resource: resource,
      context: {},
    });
  }

  /**
   * When an asynchronous operation is initiated or completes a callback is called to
   * notify the user. The before callback is called just before said callback is executed.
   * @param {Number} asyncId
   */
  _before(/* asyncId */) {
  }

  /**
   * Called immediately after the callback specified in before is completed.
   * @param {Number} asyncId
   */
  _after(/* asyncId */) {
  }

  /**
   * Called after the resource corresponding to asyncId is destroyed.
   * @param {Number} asyncId
   */
  _destroy(asyncId) {
    this._store.delete(asyncId);
  }
}

module.exports = AsyncContextStore;
