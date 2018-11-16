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
   * @param {Boolean} [debug]
   */
  constructor({ debug } = {}) {
    ['_init', '_before', '_after', '_destroy'].forEach((methodName) => {
      const originalMethod = this[methodName].bind(this);

      if (debug) {
        this[methodName] = (...args) => {
          if (debug) {
            this.log(methodName, ...args);
          }
          return originalMethod(...args);
        };
      } else {
        this[methodName] = (...args) => originalMethod(...args);
      }
    });

    this._hook = asyncHooks.createHook({
      init: this._init,
      before: this._before,
      // after: this._after,
      destroy: this._destroy,
    });

    this._store = new Map();
    this._currentId = this.getCurrentId();
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
   * @return {AsyncHook}
   */
  enable() {
    this._store.set(this._currentId, {
      _parentId: null,
      data: {},
    });

    return this._hook.enable();
  }

  /**
   * Disable listening for new asynchronous events.
   * @return {AsyncHook}
   */
  disable() {
    return this._hook.disable();
  }

  /**
   * Return the ID of the current execution context.
   * @return {Number}
   */
  getCurrentId() {
    return asyncHooks.executionAsyncId();
  }

  /**
   * Return the ID of the handle responsible for triggering the callback of the current execution
   * scope to call.
   * @return {Number}
   */
  getParentId() {
    return asyncHooks.triggerAsyncId();
  }

  /**
   * @param {*}
   */
  log(...args) {
    fs.writeSync(FD_STDOUT, `${format(...args)}\n`);
  }

  /**
   * Saves a value in the current context.
   * @param {String} key
   * @param {*} value
   * @return {*} value
   */
  set(key, value) {
    this.log(`[${this._currentId}] SET > '${key}' = ${value}`);

    const { data } = this._store.get(this._currentId);
    data[key] = value;

    return value;
  }

  /**
   * Lookups for a value in the chain going from the current context up to the root context.
   * @param {String} key
   * @return {*} value
   */
  get(key) {
    let value;
    let id = this._currentId;
    let found = false;

    while (id) {
      const { data, _parentId } = this._store.get(id);

      found = key in data;
      if (found) {
        value = data[key];
        break;
      }

      id = _parentId;
    }

    if (found) {
      this.log(`[${this._currentId}] GET < '${key}' = ${value} (from ${id})`);
    } else {
      this.log(`[${this._currentId}] GET < '${key}' -> not found!`);
    }

    return value;
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
      data: {},
    });
  }

  /**
   * When an asynchronous operation is initiated or completes a callback is called to
   * notify the user. The before callback is called just before said callback is executed.
   * @param {Number} asyncId
   */
  _before(asyncId) {
    this._currentId = asyncId;
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
