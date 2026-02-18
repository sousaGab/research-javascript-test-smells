it('should correctly do random selection based on weights', () => {
  const ATTEMPTS_NUM = 1000;
  const THRESHOLD = 50;

  const items = ['a', 'b', 'c'];
  const weights = [0.1, 0.3, 0.6];

  const counter = [];
  for (let i = 0; i < ATTEMPTS_NUM; i += 1) {
    const randomItem = weightedRandom(items, weights);
    if (!counter[randomItem.index]) {
      counter[randomItem.index] = 1;
    } else {
      counter[randomItem.index] += 1;
    }
  }

  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    expect(counter[itemIndex]).toBeGreaterThan(ATTEMPTS_NUM * weights[itemIndex] - THRESHOLD);
    expect(counter[itemIndex]).toBeLessThan(ATTEMPTS_NUM * weights[itemIndex] + THRESHOLD);
  }
})