// Your COMPLETE refactored test code here

it('should not remove unnamed handlers', function (done) {
    const SEARCH_TERM = 'jonny';
    const EXPECTED_HANDLERS_LENGTH = 2;

    const searchComplete = function (list) {
        expect(list.handlers.searchComplete.length).toEqual(EXPECTED_HANDLERS_LENGTH);
        list.off('searchComplete', function () {});
        list.off('searchComplete', searchComplete);
        expect(list.handlers.searchComplete.length).toEqual(EXPECTED_HANDLERS_LENGTH);
        done();
    }

    list.on('searchComplete', function () {});
    list.on('searchComplete', searchComplete);
    list.on('searchComplete', function () {});
    list.search(SEARCH_TERM);
});