it('should select items based on their weights within an acceptable statistical range', () => {
  const numberOfAttempts = 1000;
  const marginOfError = 50;

  const items = ['a', 'b', 'c'];
  const weights = [0.1, 0.3, 0.6];

  const selectionCounts = Array(items.length).fill(0);
  for (let i = 0; i < numberOfAttempts; i += 1) {
    const randomItem = weightedRandom(items, weights);
    selectionCounts[randomItem.index] += 1;
  }

  weights.forEach((weight, index) => {
    const actualCount = selectionCounts[index];
    const expectedCount = numberOfAttempts * weight;

    const lowerBound = expectedCount - marginOfError;
    const upperBound = expectedCount + marginOfError;

    expect(actualCount).toBeGreaterThan(lowerBound);
    expect(actualCount).toBeLessThan(upperBound);
  });
});