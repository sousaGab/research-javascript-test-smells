it('should correctly do random selection based on weights', () => {
  const ATTEMPTS_NUM = 1000;
  const THRESHOLD = 50;

  const items = ['a', 'b', 'c'];
  const weights = [0.1, 0.3, 0.6];

  const counter = new Array(items.length).fill(0);
  
  for (let i = 0; i < ATTEMPTS_NUM; i += 1) {
    const randomItem = weightedRandom(items, weights);
    counter[randomItem.index] += 1;
  }

  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    const expectedCount = ATTEMPTS_NUM * weights[itemIndex];
    expect(counter[itemIndex]).toBeGreaterThan(expectedCount - THRESHOLD);
    expect(counter[itemIndex]).toBeLessThan(expectedCount + THRESHOLD);
  }
});