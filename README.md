# Async Context Store

A context storage for async resources, based on the Node.js [async_hooks](https://nodejs.org/api/async_hooks.html) package.

## 🔗 Installation

```shell
$ npm install async-context-store
```

## 🔗 Usage

## Example

```javascript
const AsyncContextStore = require('async-context-store');

const resolveAfter = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const asyncContextStore = new AsyncContextStore().enable();

  const request1P = resolveAfter(10)
    .then(async () => {
      asyncContextStore.set('request-id', 42);
      await resolveAfter(100);
      asyncContextStore.get('request-id') === 42; // true
    });

  const request2P = resolveAfter(20)
    .then(async () => {
      asyncContextStore.set('request-id', 43);
      await resolveAfter(20);
      asyncContextStore.get('request-id') === 43; // true
    });

  await Promise.all([request1P, request2P]);

  asyncContextStore.disable(false).logStore();
})();
```

## API

```javascript
class AsyncContextStore {
  /**
   * @param {Object} [debug]
   * @param {Boolean} [debug.hooks=false]
   * @param {Boolean} [debug.methods=false]
   */
  constructor({ debug } = { debug: { hooks: false, methods: false } })

  /**
   * @return {Number} Number of contexts
   */
  get size()

  /**
   * @return {Object}
   */
  get store()

  /**
   * Allow callbacks of the AsyncHook instance to call.
   * @return {AsyncContextStore}
   */
  enable()

  /**
   * Disable listening for new asynchronous events and clears the contexts store.
   * @return {AsyncContextStore}
   */
  disable()

  /**
   * Saves a value in the current context.
   * @param {String} key
   * @param {*} value
   */
  set(key, value)

  /**
   * Lookups for a value in the chain going from the current context up to the root context.
   * @param {String} key
   * @return {*|Symbol} value
   */
  get(key)

  /**
   * @param {...any} args
   */
  log(...args)

  /**
   * @param {Number} [asyncId=this._asyncHooks.executionAsyncId()]
   */
  logContext(asyncId = this._asyncHooks.executionAsyncId())

  /**
   * @param {Number} [asyncId=this._asyncHooks.executionAsyncId()]
   */
  logStore()
}

AsyncContextStore.NOT_FOUND = Symbol('NotFound');
```

## 🔗 Demo

Clone the project...

```shell
$ git clone https://github.com/mawrkus/async-context-store.git
$ cd async-context-store
$ npm install
$ npm run demo
```
