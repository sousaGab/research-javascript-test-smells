it('should select items according to their weights within an acceptable tolerance', () => {
  const ATTEMPTS_NUM = 1000;
  const THRESHOLD = 50;

  const items = ['a', 'b', 'c'];
  const weights = [0.1, 0.3, 0.6];

  const counter = [];

  for (let i = 0; i < ATTEMPTS_NUM; i += 1) {
    const randomItem = weightedRandom(items, weights);
    counter[randomItem.index] = (counter[randomItem.index] || 0) + 1;
  }

  items.forEach((_, index) => {
    const expectedCount = ATTEMPTS_NUM * weights[index];
    expect(counter[index]).toBeGreaterThan(expectedCount - THRESHOLD);
    expect(counter[index]).toBeLessThan(expectedCount + THRESHOLD);
  });
});