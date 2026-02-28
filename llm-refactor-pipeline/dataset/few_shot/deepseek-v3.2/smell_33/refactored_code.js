const DEFAULT_PAGE_COUNT = 4;
const FIRST_PAGE_NUMBER = 1;
const SECOND_PAGE_NUMBER = 2;
const ELLIPSIS_TEXT = '...';
const LAST_PAGE_NUMBER = 9;
const UNDEFINED_ELEMENT = undefined;

it('should have default settings', function () {
    expect(pagination.find('a').length).toEqual(DEFAULT_PAGE_COUNT);
    expect(pagination.find('a').get(0).innerHTML).toEqual(FIRST_PAGE_NUMBER);
    expect(pagination.find('a').get(1).innerHTML).toEqual(SECOND_PAGE_NUMBER);
    expect(pagination.find('a').get(2).innerHTML).toEqual(ELLIPSIS_TEXT);
    expect(pagination.find('a').get(3).innerHTML).toEqual(LAST_PAGE_NUMBER);
    expect(pagination.find('a').get(4)).toEqual(UNDEFINED_ELEMENT);
});