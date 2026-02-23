it('should distribute selections according to their weights within an acceptable deviation', () => {
  const NUMBER_OF_SELECTIONS = 1000;
  const ALLOWED_DEVIATION = 50;

  const items = ['a', 'b', 'c'];
  const weights = [0.1, 0.3, 0.6];

  const selectionCounts = new Array(items.length).fill(0);
  for (let i = 0; i < NUMBER_OF_SELECTIONS; i += 1) {
    const randomItem = weightedRandom(items, weights);
    selectionCounts[randomItem.index] += 1;
  }

  weights.forEach((weight, index) => {
    const expectedCount = NUMBER_OF_SELECTIONS * weight;
    const actualCount = selectionCounts[index];

    const lowerBound = expectedCount - ALLOWED_DEVIATION;
    const upperBound = expectedCount + ALLOWED_DEVIATION;

    expect(actualCount).toBeGreaterThan(lowerBound);
    expect(actualCount).toBeLessThan(upperBound);
  });
});