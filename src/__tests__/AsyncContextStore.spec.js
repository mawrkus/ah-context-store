const AsyncContextStore = require('../AsyncContextStore');

const resolveAfter = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('AsyncContextStore', () => {
  it('should be a class with the following API: enable(), disable(), set(), get(), log(), logContext(), logStore()', () => {
    expect(AsyncContextStore).toBeInstanceOf(Function);
    expect(AsyncContextStore.prototype.enable).toBeInstanceOf(Function);
    expect(AsyncContextStore.prototype.disable).toBeInstanceOf(Function);
    expect(AsyncContextStore.prototype.set).toBeInstanceOf(Function);
    expect(AsyncContextStore.prototype.get).toBeInstanceOf(Function);
    expect(AsyncContextStore.prototype.log).toBeInstanceOf(Function);
    expect(AsyncContextStore.prototype.logContext).toBeInstanceOf(Function);
    expect(AsyncContextStore.prototype.logStore).toBeInstanceOf(Function);
  });

  it('should expose the "size" and "store" properties', () => {
    const asyncContextStore = new AsyncContextStore();

    expect(asyncContextStore.size).toEqual(expect.any(Number));
    expect(asyncContextStore.store).toBeInstanceOf(Object);
  });

  describe('#enable(createRootContext)', () => {
    it('should clear the store', () => {
      const asyncContextStore = new AsyncContextStore();

      asyncContextStore.enable();

      expect(asyncContextStore.size).toBe(0);
      expect(asyncContextStore.store).toEqual({});
    });
  });

  describe('#disable(clearAll)', () => {
    it('should clear the store', () => {
      const asyncContextStore = new AsyncContextStore();

      asyncContextStore.enable();
      asyncContextStore.disable();

      expect(asyncContextStore.size).toBe(0);
      expect(asyncContextStore.store).toEqual({});
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

    it('should retrieve a value from an async context previously created (depth 1)', async () => {
      asyncContextStore = new AsyncContextStore().enable();

      expect.assertions(1);

      asyncContextStore.set('test', 42);
      await resolveAfter(10);

      expect(asyncContextStore.get('test')).toBe(42);
    });

    it('should retrieve values stored from multiple async contexts (depth 2)', async () => {
      asyncContextStore = new AsyncContextStore().enable();

      expect.assertions(2);

      asyncContextStore.set('depth-1', 42);
      await resolveAfter(10);

      asyncContextStore.set('depth-2', 43);
      await resolveAfter(10);

      expect(asyncContextStore.get('depth-1')).toBe(42);
      expect(asyncContextStore.get('depth-2')).toBe(43);
    });

    describe('a more complex scenario', () => {
      it('should retrieve all values stored properly', async () => {
        asyncContextStore = new AsyncContextStore().enable();

        expect.assertions(2);

        const request1P = resolveAfter(10)
          .then(async () => {
            asyncContextStore.set('request-id', 42);
            await resolveAfter(100);

            expect(asyncContextStore.get('request-id')).toBe(42);
          });

        const request2P = resolveAfter(20)
          .then(async () => {
            asyncContextStore.set('request-id', 43);
            await resolveAfter(20);

            expect(asyncContextStore.get('request-id')).toBe(43);
          });

        await Promise.all([request1P, request2P]);
      });
    });
  });
});
