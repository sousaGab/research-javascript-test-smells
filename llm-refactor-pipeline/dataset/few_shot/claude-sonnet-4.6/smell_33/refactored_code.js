it('should have default settings', function () {
      const EXPECTED_ANCHOR_COUNT = 4;
      const FIRST_PAGE_LABEL = '1';
      const SECOND_PAGE_LABEL = '2';
      const ELLIPSIS_LABEL = '...';
      const LAST_PAGE_LABEL = '9';
      const OUT_OF_BOUNDS_INDEX = 4;

      expect(pagination.find('a').length).toEqual(EXPECTED_ANCHOR_COUNT)
      expect(pagination.find('a').get(0).innerHTML).toEqual(FIRST_PAGE_LABEL)
      expect(pagination.find('a').get(1).innerHTML).toEqual(SECOND_PAGE_LABEL)
      expect(pagination.find('a').get(2).innerHTML).toEqual(ELLIPSIS_LABEL)
      expect(pagination.find('a').get(3).innerHTML).toEqual(LAST_PAGE_LABEL)
      expect(pagination.find('a').get(OUT_OF_BOUNDS_INDEX)).toEqual(undefined)
    })