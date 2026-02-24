it('should select items randomly according to their weights', () => {
  const numberOfSelections = 1000;
  const acceptableErrorMargin = 50;

  const items = ['a', 'b', 'c'];
  const weights = [0.1, 0.3, 0.6];

  const selectionCounts = new Array(items.length).fill(0);
  for (let i = 0; i < numberOfSelections; i += 1) {
    const {
      index
    } = weightedRandom(items, weights);
    selectionCounts[index] += 1;
  }

  weights.forEach((weight, index) => {
    const actualCount = selectionCounts[index];
    const expectedCount = numberOfSelections * weight;

    const lowerBound = expectedCount - acceptableErrorMargin;
    const upperBound = expectedCount + acceptableErrorMargin;

    expect(actualCount).toBeGreaterThan(lowerBound);
    expect(actualCount).toBeLessThan(upperBound);
  });
});