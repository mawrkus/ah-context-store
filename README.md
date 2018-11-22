# Async Context Store

A context storage for async resources, based on the Node.js [Async Hooks API](https://nodejs.org/api/async_hooks.html).

## 🔗 Installation (not yet published)

```shell
$ npm install ah-context-store // soon...
```

## 🔗 Usage

## Example

```javascript
const AsyncContextStore = require('async-context-store');

const asyncContextStore = new AsyncContextStore().enable();

const resolveAfter = ms => new Promise(resolve => setTimeout(resolve, ms));

function handleRequest(requestId) {
  return resolveAfter(10, `handle(${requestId})`)
    .then(() => {
      asyncContextStore.logStore();
      assert.strictEqual(requestId, asyncContextStore.get('request.id'));
    });
}

(async () => {
  const request1P = resolveAfter(10, 'request1')
    .then(() => {
      asyncContextStore.set('request.id', 42).logStore();
    })
    .then(() => {
      assert.strictEqual(42, asyncContextStore.get('request.id'));
      return handleRequest(42);
    });

  const request2P = resolveAfter(10, 'request2')
    .then(() => {
      asyncContextStore.set('request.id', 69).logStore();
    })
    .then(() => {
      assert.strictEqual(69, asyncContextStore.get('request.id'));
      return handleRequest(69);
    });

  return Promise.all([request1P, request2P])
    .then(() => {
      assert.strictEqual(undefined, asyncContextStore.get('request.id'));
      asyncContextStore.logStore().disable();
    });
})();
```

## API

```javascript
class AsyncContextStore {
  /**
   * @param {String[]} [debug=[]] ['methods', 'hooks]
   */
  constructor({ debug } = { debug: [] }) {}

  /**
   * @return {Number} Number of contexts currently stored.
   */
  get size() {}

  /**
   * @return {Object}
   */
  get store() {}

  /**
   * @return {AsyncContextStore} this
   */
  enable() {}

  /**
   * @return {AsyncContextStore} this
   */
  disable() {}

  /**
   * @param {String} key
   * @param {*} value
   * @return {AsyncContextStore} this
   */
  set(key, value) {}

  /**
   * @param {String} key
   * @return {*} value
   */
  get(key) {}

  /**
   * @param {...any} args
   * @return {AsyncContextStore} this
   */
  log(...args) {}

  /**
   * @param {Number} [asyncId=this._asyncHooks.executionAsyncId()]
   * @return {AsyncContextStore} this
   */
  logContext(asyncId = this._asyncHooks.executionAsyncId()) {}

  /**
   * @return {AsyncContextStore} this
   */
  logStore() {}
```

## 🔗 Demos

- Promise-based demos.
- `async-await` demos.
- [Hapi v17](https://hapijs.com/api/17.7.0) demo, to illustrate HTTP request tracing across multiple services.

Clone the project...

```shell
$ git clone https://github.com/mawrkus/async-context-store.git
$ cd async-context-store
$ npm install

$ npm run demo:async-await
$ npm run demo:promises
$ npm run demo:server

$ ./demos/server/stress my-agent
```

## 🔗 Resources

- "Grokking Asynchronous Work in Node.js" by Thorsten Lorenz:
  + Video -> https://www.youtube.com/watch?v=8Xoht4J6Jjw
  + Slides -> http://thlorenz.com/talks/async-hooks/book/
