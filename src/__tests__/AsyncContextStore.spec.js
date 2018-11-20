const AsyncContextStore = require('../AsyncContextStore');

// const resolveAfter = ms => new Promise(resolve => setTimeout(resolve, ms));

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
});
