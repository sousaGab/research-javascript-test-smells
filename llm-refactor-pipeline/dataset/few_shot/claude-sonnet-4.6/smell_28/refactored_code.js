const EXPECTED_REMOVE_COUNT = 0;
const EXPECTED_LIST_LENGTH = 1;
const SEARCH_FIELD = 'name';
const SEARCH_VALUE_LOWERCASE = 'jonny';

it('should not remove anything due to case sensitivity', function () {
  var count = list.remove(SEARCH_FIELD, SEARCH_VALUE_LOWERCASE);
  expect(count).toBe(EXPECTED_REMOVE_COUNT);
  expect(list.items.length).toEqual(EXPECTED_LIST_LENGTH);
});