// Your COMPLETE refactored test code here

const ORIGINAL_SEARCH_TERM = 'thre';
const EXPECTED_MATCHING_ITEMS_LENGTH = 4;

it('should find result', function () {
    list.fuzzySearch(ORIGINAL_SEARCH_TERM);
    expect(list.matchingItems.length).toBe(EXPECTED_MATCHING_ITEMS_LENGTH);
});