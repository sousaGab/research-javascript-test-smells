it('should have default settings', function () {
      const EXPECTED_LINK_COUNT = 4;
      const FIRST_PAGE_INDEX = 0;
      const SECOND_PAGE_INDEX = 1;
      const ELLIPSIS_INDEX = 2;
      const LAST_PAGE_INDEX = 3;
      const NON_EXISTENT_INDEX = 4;

      const FIRST_PAGE_TEXT = '1';
      const SECOND_PAGE_TEXT = '2';
      const ELLIPSIS_TEXT = '...';
      const LAST_PAGE_TEXT = '9';

      const paginationLinks = pagination.find('a');

      expect(paginationLinks.length).toEqual(EXPECTED_LINK_COUNT);
      expect(paginationLinks.get(FIRST_PAGE_INDEX).innerHTML).toEqual(FIRST_PAGE_TEXT);
      expect(paginationLinks.get(SECOND_PAGE_INDEX).innerHTML).toEqual(SECOND_PAGE_TEXT);
      expect(paginationLinks.get(ELLIPSIS_INDEX).innerHTML).toEqual(ELLIPSIS_TEXT);
      expect(paginationLinks.get(LAST_PAGE_INDEX).innerHTML).toEqual(LAST_PAGE_TEXT);
      expect(paginationLinks.get(NON_EXISTENT_INDEX)).toEqual(undefined);
    });