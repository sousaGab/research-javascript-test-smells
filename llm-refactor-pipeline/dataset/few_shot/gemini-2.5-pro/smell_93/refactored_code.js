it('should correctly do random selection based on weights', () => {
  const numberOfAttempts = 1000;
  const acceptableErrorMargin = 50;

  const items = ['a', 'b', 'c'];
  const weights = [0.1, 0.3, 0.6];

  const selectionCounts = Array(items.length).fill(0);
  for (let i = 0; i < numberOfAttempts; i += 1) {
    const randomItem = weightedRandom(items, weights);
    selectionCounts[randomItem.index] += 1;
  }

  weights.forEach((weight, index) => {
    const expectedCount = numberOfAttempts * weight;
    const actualCount = selectionCounts[index];
    const lowerBound = expectedCount - acceptableErrorMargin;
    const upperBound = expectedCount + acceptableErrorMargin;

    expect(actualCount).toBeGreaterThan(lowerBound);
    expect(actualCount).toBeLessThan(upperBound);
  });
});