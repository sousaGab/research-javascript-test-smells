it('should correctly do random selection based on weights', () => {
    const attempts = 1000;
    const threshold = 50;

    const items = ['a', 'b', 'c'];
    const weights = [0.1, 0.3, 0.6];

    const counter = [];
    for (let i = 0; i < attempts; i++) {
        const randomItem = weightedRandom(items, weights);
        if (!counter[randomItem.index]) {
            counter[randomItem.index] = 1;
        } else {
            counter[randomItem.index]++;
        }
    }

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const expectedCount = attempts * weights[itemIndex];
        const actualCount = counter[itemIndex];
        expect(actualCount).toBeGreaterThan(expectedCount - threshold);
        expect(actualCount).toBeLessThan(expectedCount + threshold);
    }
});