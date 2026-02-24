it('should select items based on the provided weights', () => {
  const numberOfAttempts = 1000;
  const acceptableDelta = 50;

  const items = ['a', 'b', 'c'];
  const weights = [0.1, 0.3, 0.6];

  const selectionCounts = Array(items.length).fill(0);
  for (let i = 0; i < numberOfAttempts; i += 1) {
    const randomItem = weightedRandom(items, weights);
    selectionCounts[randomItem.index] += 1;
  }

  selectionCounts.forEach((actualCount, index) => {
    const expectedCount = numberOfAttempts * weights[index];
    const lowerBound = expectedCount - acceptableDelta;
    const upperBound = expectedCount + acceptableDelta;

    expect(actualCount).toBeGreaterThan(lowerBound);
    expect(actualCount).toBeLessThan(upperBound);
  });
});