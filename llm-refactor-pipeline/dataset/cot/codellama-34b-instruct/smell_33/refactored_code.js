// Your COMPLETE refactored test code here

it('should have default settings', function () {
    const DEFAULT_PAGE_SIZE = 10;
    const DEFAULT_TOTAL_PAGES = 9;
    const DEFAULT_CURRENT_PAGE = 1;

    const pagination = shallow(<Pagination />);

    expect(pagination.find('a').length).toEqual(4);
    expect(pagination.find('a').get(0).innerHTML).toEqual(DEFAULT_CURRENT_PAGE.toString());
    expect(pagination.find('a').get(1).innerHTML).toEqual((DEFAULT_CURRENT_PAGE + 1).toString());
    expect(pagination.find('a').get(2).innerHTML).toEqual('...');
    expect(pagination.find('a').get(3).innerHTML).toEqual(DEFAULT_TOTAL_PAGES.toString());
    expect(pagination.find('a').get(4)).toEqual(undefined);
});