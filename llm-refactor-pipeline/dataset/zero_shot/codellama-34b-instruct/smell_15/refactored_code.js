it('should search for an element in sorted array', () => {
    const search = (array, target) => {
        const index = jumpSearch(array, target);
        expect(index).toBe(array.indexOf(target));
    };

    search([], 1);
    search([1], 2);
    search([1], 1);
    search([1, 2], 1);
    search([1, 2], 1);
    search([1, 1, 1], 1);
    search([1, 2, 5, 10, 20, 21, 24, 30, 48], 2);
    search([1, 2, 5, 10, 20, 21, 24, 30, 48], 0);
    search([1, 2, 5, 10, 20, 21, 24, 30, 48], 0);
    search([1, 2, 5, 10, 20, 21, 24, 30, 48], 7);
    search([1, 2, 5, 10, 20, 21, 24, 30, 48], 5);
    search([1, 2, 5, 10, 20, 21, 24, 30, 48], 20);
    search([1, 2, 5, 10, 20, 21, 24, 30, 48], 30);
    search([1, 2, 5, 10, 20, 21, 24, 30, 48], 48);
});