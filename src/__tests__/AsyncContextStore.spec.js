const AsyncContextStore = require('../AsyncContextStore');

const resolveAfter = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('AsyncContextStore', () => {
  it('should be a class with the following API: enable(), disable(), set(), get(), log()', () => {
    expect(AsyncContextStore).toBeInstanceOf(Function);
    expect(AsyncContextStore.prototype.enable).toBeInstanceOf(Function);
    expect(AsyncContextStore.prototype.disable).toBeInstanceOf(Function);
    expect(AsyncContextStore.prototype.set).toBeInstanceOf(Function);
    expect(AsyncContextStore.prototype.get).toBeInstanceOf(Function);
    expect(AsyncContextStore.prototype.log).toBeInstanceOf(Function);
  });

  it('should expose the "size" and "data" properties', () => {
    const asyncContextStore = new AsyncContextStore();

    expect(asyncContextStore.size).toEqual(expect.any(Number));
    expect(asyncContextStore.data).toBeInstanceOf(Map);
  });

  describe('#enable(createRootContext)', () => {
    it('should create a new root context', () => {
      const asyncContextStore = new AsyncContextStore();
      expect(asyncContextStore.size).toBe(0);

      asyncContextStore.enable();
      expect(asyncContextStore.size).toBe(1);

      const rootContext = asyncContextStore.data.values().next().value;

      expect(rootContext).toEqual({
        _parentId: null,
        context: {},
      });
    });
  });

  describe('#disable(clearAll)', () => {
    it('should clears all the contexts previously created', () => {
      const asyncContextStore = new AsyncContextStore().enable();

      asyncContextStore.disable();

      expect(asyncContextStore.size).toBe(0);
    });
  });

  describe('#set(key, value) & #get(key)', () => {
    let asyncContextStore;

    afterEach(() => {
      asyncContextStore.disable();
    });

    it('should store then retrieve a value from the same async context', () => {
      asyncContextStore = new AsyncContextStore().enable();

      asyncContextStore.set('test', 42);

      expect(asyncContextStore.get('test')).toBe(42);
    });

    it('should retrieve a value from an async context previously created (depth 1)', (done) => {
      asyncContextStore = new AsyncContextStore().enable();

      expect.assertions(1);

      asyncContextStore.set('test', 42);

      resolveAfter(10)
        .then(() => {
          expect(asyncContextStore.get('test')).toBe(42);
          done();
        })
        .catch(done.fail);
    });

    it('should retrieve values stored from multiple async contexts (depth 2)', (done) => {
      asyncContextStore = new AsyncContextStore().enable();

      expect.assertions(2);

      asyncContextStore.set('depth-1', 42);

      resolveAfter(10)
        .then(() => {
          asyncContextStore.set('depth-2', 43);
          return resolveAfter(10);
        })
        .then(() => {
          expect(asyncContextStore.get('depth-1')).toBe(42);
          expect(asyncContextStore.get('depth-2')).toBe(43);
          done();
        })
        .catch(done.fail);
    });

    describe('a more complex scenario', () => {
      it('should retrieve all values stored properly', (done) => {
        asyncContextStore = new AsyncContextStore().enable();

        expect.assertions(2);

        const request1P = resolveAfter(10)
          .then(() => {
            asyncContextStore.set('request-id', 42);
            return resolveAfter(100);
          })
          .then(() => {
            expect(asyncContextStore.get('request-id')).toBe(42);
          });

        const request2P = resolveAfter(20)
          .then(() => {
            asyncContextStore.set('request-id', 43);
            return resolveAfter(20);
          })
          .then(() => {
            expect(asyncContextStore.get('request-id')).toBe(43);
          });

        Promise.all([request1P, request2P])
          .then(() => {
            done();
          })
          .catch(done.fail);
      });
    });

    describe('without enabling the async hooks', () => {
      it('should have no effect', (done) => {
        asyncContextStore = new AsyncContextStore();

        expect.assertions(5);

        asyncContextStore.set('depth-1', 42);
        expect(asyncContextStore.get('depth-1')).toBeUndefined();

        resolveAfter(10)
          .then(() => {
            asyncContextStore.set('depth-2', 43);
            expect(asyncContextStore.get('depth-1')).toBeUndefined();
            expect(asyncContextStore.get('depth-2')).toBeUndefined();
            return resolveAfter(10);
          })
          .then(() => {
            expect(asyncContextStore.get('depth-1')).toBeUndefined();
            expect(asyncContextStore.get('depth-2')).toBeUndefined();
            done();
          })
          .catch(done.fail);
      });
    });
  });
});
