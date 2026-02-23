it('should have default settings', function () {
      const EXPECTED_LINK_COUNT = 4;
      const FIRST_PAGE_LABEL = '1';
      const SECOND_PAGE_LABEL = '2';
      const ELLIPSIS_LABEL = '...';
      const LAST_PAGE_LABEL = '9';

      const FIRST_LINK_INDEX = 0;
      const SECOND_LINK_INDEX = 1;
      const THIRD_LINK_INDEX = 2;
      const FOURTH_LINK_INDEX = 3;
      const OUT_OF_BOUNDS_INDEX = 4;

      expect(pagination.find('a').length).toEqual(EXPECTED_LINK_COUNT);
      expect(pagination.find('a').get(FIRST_LINK_INDEX).innerHTML).toEqual(FIRST_PAGE_LABEL);
      expect(pagination.find('a').get(SECOND_LINK_INDEX).innerHTML).toEqual(SECOND_PAGE_LABEL);
      expect(pagination.find('a').get(THIRD_LINK_INDEX).innerHTML).toEqual(ELLIPSIS_LABEL);
      expect(pagination.find('a').get(FOURTH_LINK_INDEX).innerHTML).toEqual(LAST_PAGE_LABEL);
      expect(pagination.find('a').get(OUT_OF_BOUNDS_INDEX)).toEqual(undefined);
    })