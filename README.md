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
    .then(() => {
      asyncContextStore.set('request-id', 42);
      return resolveAfter(100);
    })
    .then(() => {
      asyncContextStore.log(asyncContextStore.get('request-id') === 42); // true
    });

  const request2P = resolveAfter(20)
    .then(() => {
      asyncContextStore.set('request-id', 43);
      return resolveAfter(20);
    })
    .then(() => {
      asyncContextStore.log(asyncContextStore.get('request-id') === 43); // true
    });

  await Promise.all([request1P, request2P]);

  asyncContextStore.disable(false);
  asyncContextStore.log('Data ->', asyncContextStore.data);
  asyncContextStore.log('# of items ->', asyncContextStore.size);
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
  constructor({ debug } = { debug: { hooks: false, methods: false } }) {}

  /**
   * @return {Number} Number of elements
   */
  get size() {}

  /**
   * @return {Map}
   */
  get data() {}

  /**
   * @param {Boolean} [createRootContext=true]
   * @return {AsyncContextStore}
   */
  enable(createRootContext = true) {}

  /**
   * @param {Boolean} [clear=true]
   * @return {AsyncContextStore}
   */
  disable(clearAll = true) {}

  /**
   * @param {String} key
   * @param {*} value
   * @return {*} value
   */
  set(key, value) {}

  /**
   * @param {String} key
   * @return {*} value
   */
  get(key) {}

  /**
   * @param {...any}
   */
  log(...args) {}

  /**
   * @param {Number} [asyncId=asyncHooks.executionAsyncId()]
   */
  logTree(asyncId) {}
}
```

## 🔗 Demo

Clone the project...

```shell
$ git clone https://github.com/mawrkus/async-context-store.git
$ cd async-context-store
$ npm install
$ npm run demo
```
